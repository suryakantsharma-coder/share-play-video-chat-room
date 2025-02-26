import useHardwareResources from "@/hooks/useHardwareResources";
import { VideoCameraIcon, MicrophoneIcon } from "@heroicons/react/24/solid";

function IPC() {
    const { videoRef, userPermission, handleUserPermissions} = useHardwareResources();

    return ( 
        <div className="w-full h-screen flex items-center justify-center bg-[white]">
            <div className="w-[100%] px-[5%] md:px-[20%] relative ">
                <video className="w-[100%] h-[100%] lg:w-[500px] lg:h-[375px] rounded-xl bg-[red] relative shadow-xl" ref={videoRef} autoPlay />
                <div className="lg:w-[500px] flex items-center justify-center gap-[10px] absolute bottom-2">
                    <VideoCameraIcon className={`w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer ${(userPermission.video) ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => {
                        handleUserPermissions(!userPermission.video, userPermission.audio)
                    }} />
                    <MicrophoneIcon className={`w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer ${(userPermission.audio) ? 'bg-blue-500' : 'bg-gray-500'}`}  onClick={() => {
                        handleUserPermissions(userPermission.video, !userPermission.audio)
                    }} />
                    
                </div>
            </div>
        </div>
    );
}

export default IPC;