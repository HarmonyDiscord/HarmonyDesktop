import path from 'node:path';
import { BrowserWindow, app, ipcMain, nativeImage, session, shell } from 'electron';
import log from 'electron-log';
import electronUpdater from 'electron-updater';
import { ERROR_LOADING } from './pages/error/errorLoading.js';
import { TITLEBAR } from './pages/partials/titlebar.js';
import { UPDATER } from './pages/updater/updater.js';
import { RPC } from './rpc.js';

function getAutoUpdater() {
	try {
		const { autoUpdater } = electronUpdater;
		return autoUpdater;
	} catch (error) {
		log.error('Error initializing autoUpdater:', error);
		return null;
	}
}

const WINDOW_ICON = nativeImage.createFromPath(path.resolve(app.getAppPath(), 'assets', 'icon.png'));
const IS_DEV = process.env['NODE_ENV'] === 'development';

const rpc = new RPC();

try {
	app.setAsDefaultProtocolClient('harmony');
	rpc.connect();
	log.initialize();
	log.eventLogger.startLogging();
	console.log = log.log;
	log.transports.file.level = 'debug';
} catch (error) {
	log.error('Initialization error:', error);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	const autoUpdater = getAutoUpdater();
	if (autoUpdater) autoUpdater.logger = log;

	let mainWindow: BrowserWindow | undefined = undefined;
	let updaterWindow: BrowserWindow | undefined = undefined;

	function createUpdaterWindow() {
		try {
			updaterWindow = new BrowserWindow({
				icon: WINDOW_ICON,
				width: 300,
				height: 300,
				frame: false,
				titleBarStyle: 'hidden',
				alwaysOnTop: true,
				resizable: false,
				movable: true,
				backgroundColor: '#641436',
				webPreferences: {
					webSecurity: !IS_DEV,
					contextIsolation: true,
					nodeIntegration: false,
					preload: path.join(import.meta.dirname, 'preload', 'updaterPreload.js')
				}
			});
			updaterWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(UPDATER)}`);
		} catch (error) {
			log.error('Error creating updater window:', error);
		}
	}

	function createMainWindow() {
		try {
			mainWindow = new BrowserWindow({
				title: 'Harmony Desktop App',
				icon: WINDOW_ICON,
				width: 1600,
				height: 800,
				minWidth: 350,
				minHeight: 450,
				frame: false,
				titleBarStyle: 'hidden',
				webPreferences: {
					webSecurity: !IS_DEV,
					contextIsolation: true,
					nodeIntegration: false,
					preload: path.join(import.meta.dirname, 'preload', 'preload.js')
				},
				backgroundColor: '#000000',
				show: false
			});

			try {
				mainWindow.loadURL(IS_DEV ? 'http://localhost:3000' : 'https://harmony.tnfangel.com', {
					extraHeaders: 'pragma: no-cache\n'
				});
			} catch (error) {
				log.error('Error loading initial URL:', error);
				mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(ERROR_LOADING)}`);
			}

			setTimeout(() => {
				if (!mainWindow?.webContents || mainWindow.webContents.isLoading()) {
					log.warn('Main window is still loading after timeout. Showing fallback.');

					try {
						mainWindow?.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(ERROR_LOADING)}`);
						mainWindow?.show();

						if (process.platform !== 'darwin') mainWindow?.webContents.executeJavaScript(TITLEBAR);
					} catch (error) {
						log.error('Error handling timeout fallback:', error);
					}
				}
			}, 15000);

			mainWindow.webContents.setWindowOpenHandler(({ url }) => {
				if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
					setImmediate(() => {
						shell.openExternal(url);
					});
				}

				return { action: 'deny' };
			});

			try {
				const ses = mainWindow.webContents.session;

				ses.clearCache();
				ses.clearHostResolverCache();

				mainWindow.reload();
			} catch (error) {
				log.error('Error clearing session cache:', error);
			}

			mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
				try {
					callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
				} catch (error) {
					log.error('Error in webRequest handler:', error);
					callback({ requestHeaders: details.requestHeaders });
				}
			});

			mainWindow.once('ready-to-show', () => {
				mainWindow?.show();
				setTimeout(() => mainWindow?.focus(), 200);
				if (process.platform !== 'darwin') {
					setTimeout(() => {
						mainWindow?.webContents.executeJavaScript(TITLEBAR).catch((err) => {
							log.error('Error executing titlebar script on ready-to-show:', err);
						});
					}, 500);
				}
			});

			mainWindow.webContents.on('did-finish-load', () => {
				try {
					if (mainWindow && !mainWindow.isDestroyed()) {
						if (process.platform !== 'darwin') {
							mainWindow.webContents.executeJavaScript(TITLEBAR).catch((err) => {
								log.error('Error executing titlebar script on did-finish-load:', err);
							});
						}
					}
				} catch (error) {
					log.error('Error in did-finish-load handler:', error);
				}
			});

			mainWindow.webContents.on('did-fail-load', async (e: any) => {
				if (!e.isMainFrame) return;

				log.error(`Main frame load failed: ${e.errorCode} - ${e.errorDescription} @ ${e.validatedURL}`);

				try {
					mainWindow?.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(ERROR_LOADING)}`);
					mainWindow?.show();
				} catch (error) {
					log.error('Error handling load failure:', error);
				}
			});

			mainWindow.webContents.on(
				'did-fail-provisional-load',
				(_event, errorCode, errorDescription, validatedURL) => {
					log.error(`Provisional load failed: ${errorCode} - ${errorDescription} @ ${validatedURL}`);

					try {
						mainWindow?.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(ERROR_LOADING)}`);
						mainWindow?.show();
					} catch (error) {
						log.error('Error handling provisional load failure:', error);
					}
				}
			);
		} catch (error) {
			log.error('Error creating main window:', error);
		}
	}

	ipcMain.on('minimize-window', () => {
		try {
			mainWindow?.minimize();
		} catch (error) {
			log.error('Error minimizing window:', error);
		}
	});

	ipcMain.on('maximize-window', () => {
		try {
			if (mainWindow?.isMaximized()) {
				mainWindow?.unmaximize();
			} else {
				mainWindow?.maximize();
			}
		} catch (error) {
			log.error('Error maximizing/unmaximizing window:', error);
		}
	});

	ipcMain.on('close-window', () => {
		try {
			mainWindow?.close();
			mainWindow = undefined;
		} catch (error) {
			log.error('Error handling close window:', error);
		}
	});

	ipcMain.on('reload', () => {
		try {
			console.log('Reloading app');
			app.relaunch();
			app.exit(0);
		} catch (error) {
			log.error('Error reloading app:', error);
		}
	});

	ipcMain.on('set-activity', async (_event, activity) => {
		try {
			await rpc.setActivity(activity);
			return { success: true };
		} catch (error) {
			log.error('Error setting RPC activity:', error);
			return { success: false, error: error instanceof Error ? error.message : String(error) };
		}
	});

	app.whenReady().then(async () => {
		try {
			await session.defaultSession.clearCache();
		} catch (error) {
			log.error('Error clearing session cache:', error);
		}

		createMainWindow();
		if (!autoUpdater) return;

		log.info('Checking for updates...');

		autoUpdater.checkForUpdates();

		autoUpdater.on('update-available', () => {
			mainWindow?.close();
			mainWindow = undefined;
			createUpdaterWindow();
			log.info('Update available. Downloading...');
		});

		autoUpdater.on('download-progress', (progressObj) => {
			try {
				let percent = Math.floor(progressObj.percent);
				if (updaterWindow && !updaterWindow.isDestroyed()) {
					updaterWindow.webContents.send('update-progress', percent);
				}
			} catch (error) {
				log.error('Error sending update progress:', error);
			}
		});

		autoUpdater.on('update-downloaded', () => {
			log.info('Update downloaded. Restarting...');
			autoUpdater.quitAndInstall(true, true);
		});

		autoUpdater.on('update-not-available', () => {
			log.info('Update not available.');
			updaterWindow?.close();
			updaterWindow = undefined;
			if (!mainWindow) createMainWindow();
		});

		autoUpdater.on('update-cancelled', () => {
			log.info('Update cancelled.');
			updaterWindow?.close();
			updaterWindow = undefined;
			if (!mainWindow) createMainWindow();
		});

		autoUpdater.on('error', (error) => {
			log.error('Auto-updater error:', error);
			updaterWindow?.close();
			updaterWindow = undefined;
			if (!mainWindow) createMainWindow();
		});
	});

	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});

	app.on('before-quit', () => {
		try {
			console.log('Stopping proxy');
		} catch (error) {
			log.error('Error stopping proxy on quit:', error);
		}
	});
}

process.on('uncaughtException', (error) => {
	log.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
	log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('exit', () => app.quit());
