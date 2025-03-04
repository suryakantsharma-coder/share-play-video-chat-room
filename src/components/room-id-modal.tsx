'use client';
import { DocumentDuplicateIcon, XMarkIcon } from '@heroicons/react/24/solid';

function RoomIdMiniComponent() {
  return (
    <div className="w-[400px] h-[180px] absolute bottom-1 right-1 bg-[#FAF9F6] rounded-[12px] p-[20px] text-[#141414] shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-bold">Your room is ready</h3>
        <XMarkIcon className="w-[20px] h-[20px] cursor-pointer" />
      </div>
      <p className="mt-[12px] text-[gray]">
        Or share this meeting link with others you want in the meeting
      </p>
      <div className="w-[100%] bg-[#D9D9D9] p-2 rounded-[4px] flex justify-between items-center mt-[12px]">
        <p>this is your room id link</p>
        <DocumentDuplicateIcon className="w-[20px] h-[20px] ml-[10px] cursor-pointer" />
      </div>
    </div>
  );
}

export default RoomIdMiniComponent;
