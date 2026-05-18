import { Client, Room } from 'colyseus.js';
import { OfficeState } from '../schema/OfficeState.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'ws://localhost:2567';
const REST_URL = SERVER_URL.replace(/^ws/, 'http');

export interface UsuarioAuth {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

export async function autenticar(email: string, nome: string): Promise<{ token: string; usuario: UsuarioAuth }> {
  const res = await fetch(`${REST_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nome }),
  });
  if (!res.ok) throw new Error(`Auth falhou: ${res.status}`);
  return res.json() as Promise<{ token: string; usuario: UsuarioAuth }>;
}

let _room: Room<OfficeState> | null = null;

export function getRoom(): Room<OfficeState> | null {
  return _room;
}

export async function conectarOffice(
  token: string,
  nome: string,
): Promise<Room<OfficeState>> {
  const client = new Client(SERVER_URL);
  _room = await client.joinOrCreate<OfficeState>('office_room', { token, nome }, OfficeState);
  return _room;
}

export function desconectar(): void {
  _room?.leave();
  _room = null;
}

export function enviarMovimento(x: number, y: number): void {
  _room?.send('move', { x, y });
}

export function enviarChat(texto: string, salaId: string): void {
  _room?.send('chat', { texto, salaId });
}
