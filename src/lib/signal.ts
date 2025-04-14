// Godot-like signals implementation by Slimebones Entertainment.

import { bone } from "../public-api";

// EXAMPLE
// 	const mySignal = new Signal();
// 	const listener = (data) => {
// 	    console.log('Received:', data);
// 	};
// 	mySignal.connect(listener);
// 	mySignal.emit('Hello, World!');
// 	mySignal.disconnect(listener);
// 	mySignal.emit('This will not be logged.');
export class Signal<T = any> {
	private _listeners: Array<(value: T) => void> = [];

	// Connect a listener to the signal
	connect(listener: (value: T) => void): void {
		this._listeners.push(listener);
	}

	// Emit a value to all connected listeners
	emit(value: T): void {
		this._listeners.forEach(listener => {
			try {
				listener(value)
			} catch (e) {
				bone.log_error(`During signal listener call, an error occurred: ${e}`)
			}
		});
	}

	// Disconnect a listener from the signal
	disconnect(listener: (value: T) => void): void {
		this._listeners = this._listeners.filter(l => l !== listener);
	}
}
