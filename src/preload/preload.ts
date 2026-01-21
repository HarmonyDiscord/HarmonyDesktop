import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	maximizeWindow: () => ipcRenderer.send('maximize-window'),
	closeWindow: () => ipcRenderer.send('close-window'),
	forceCloseApp: () => ipcRenderer.send('force-close-app'),
	setActivity: (activity?: any) => ipcRenderer.send('set-activity', activity)
});
