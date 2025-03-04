import { Socket } from 'socket.io-client';

export interface roomProviderType {
  roomId: string;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  handleUserJoined: ({ email, id }: CallUserParams) => void;
  handleSubmitForm: (socket: Socket) => void;
  createOffer: (socket: Socket) => void;
  handleIncomingCall: ({ from, offer, email, socket }: IncomingCallParams) => void;
  handleCallAccepted: ({ ans }: CallAcceptedParams) => void;
  handleNegoNeedIncoming: ({ from, offer }: NegotiationParams) => void;
  handleNegoNeedFinal: ({ ans }: NegotiationFinalParams) => void;
  disconnectCall: (socket: Socket) => void;
  createDataChannel: () => void;
  sendMessage: (message: string) => void;
}

export interface mediaControlsOptions {
  video: boolean;
  audio: boolean;
}

export interface CallUserParams {
  email: string;
  id: string;
}

export interface IncomingCallParams {
  from: string;
  offer: RTCSessionDescriptionInit;
  email: string;
  socket: Socket | null;
}

export interface NegotiationParams {
  from: string;
  offer: RTCSessionDescriptionInit;
  socket: Socket | null;
}

export interface CallAcceptedParams {
  from: string;
  ans: RTCSessionDescriptionInit;
}

export interface NegotiationFinalParams {
  ans: RTCSessionDescriptionInit;
}
