import { useState } from "react";
import { Label2D } from "./Label2D";

export const MyComment: React.FC<{ parent: Label2D }> = ({ parent }: { parent: Label2D }) => {
  const [isClicked, setIsClicked] = useState(false);
  parent.onClickChange = () => {
    setIsClicked(!isClicked);
  }
  return (
    <>
      {isClicked && <div className=
        'absolute translate-y-[-310px] bg-green-100 border-black border-2 h-[300px] w-[300px]'>
        {isClicked && <Message />}
      </div>}
    </>
  )
}

const Message = () => {
  return (
    <div>message</div>
  );
};
export default Message;