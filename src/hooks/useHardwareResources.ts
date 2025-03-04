import { useEffect, useRef, useState } from 'react';

interface userPermissionParmas {
  video: boolean;
  audio: boolean;
}

function useHardwareResources() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream>();
  const [userPermission, setUserPermission] = useState<userPermissionParmas>({
    video: true,
    audio: true,
  });

  // function for access camera and microphone

  const accessDefaultCamereaAndMicrophone = async (permission: {
    video: boolean;
    audio: boolean;
  }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(permission);
      videoRef.current!.srcObject = stream;
      setStream(stream);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        alert('Please allow access to camera and microphone.');
      }
    }
  };

  const handleUserPermissions = (video: boolean, audio: boolean) =>
    setUserPermission({ video, audio });

  const clearTheStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    accessDefaultCamereaAndMicrophone(userPermission);

    return () => {
      clearTheStream();
    };
  }, [userPermission]);

  return {
    videoRef,
    userPermission,
    handleUserPermissions,
  };
}

export default useHardwareResources;
