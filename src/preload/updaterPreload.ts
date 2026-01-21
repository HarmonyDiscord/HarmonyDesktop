import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
	onUpdateProgress: (callback: (color: string) => void) => {
		const listener = (_event: any, color: string) => {
			callback(color);
		};
		ipcRenderer.on('update-progress', listener);

		return () => ipcRenderer.removeListener('update-progress', listener);
	}
});
