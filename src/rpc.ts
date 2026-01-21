import { Client } from '@tnfangel/discord-rpc-revamp';

export class RPC {
	private client: Client;
	private reconnectEnabled = true;
	public connected = false;

	public constructor() {
		this.client = new Client();
	}

	public connect() {
		if (this.connected) return;

		this.client = new Client();

		this.client.on('ready', async () => {
			this.connected = true;
			console.log('Discord RPC Ready');
		});

		this.client.on('disconnected', () => {
			console.log('Disconnected from Discord RPC');
			this.connected = false;

			if (this.reconnectEnabled) {
				this.reconnect();
			}
		});

		console.log('Connecting to Discord RPC');
		this.client.connect({ clientId: '1261305104397500437' }).catch((e) => {
			console.error('Unable to connect to Discord RPC', e);
		});
	}

	public async setActivity(activity: any) {
		console.log(activity);
		if (!this.connected) {
			throw new Error('Discord RPC not connected');
		}

		try {
			if (activity) {
				await this.client.setActivity({} as any, activity);
				console.log('Updated Discord RPC activity');
			}
		} catch (e) {
			console.error('Error setting RPC activity:', e);
			throw e;
		}
	}

	private reconnect() {
		setTimeout(() => {
			if (!this.connected && this.reconnectEnabled) {
				console.log('Reconnecting to Discord RPC');
				this.connect();
			}
		}, 10_000);
	}

	public disconnect() {
		this.reconnectEnabled = false;
		if (this.client) {
			this.client.destroy();
			console.log('Manually disconnected from Discord RPC');
		}
		this.connected = false;
	}
}
