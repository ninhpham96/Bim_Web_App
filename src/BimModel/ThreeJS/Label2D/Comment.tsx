import ReactDOM from 'react-dom/client';
import { MyComment } from './Message';
import { Label2D } from './Label2D';

export function CreateComment(parent: Label2D) {
  const div = document.createElement('div');
  div.className =
    "h-[32px] w-[32px] rounded-full border-[2px] border-green-400 bg-blue-400 pointer-events-auto cursor-pointer";
  ReactDOM.createRoot(div).render(<MyComment {...{ parent }} />);
  return div;
}
