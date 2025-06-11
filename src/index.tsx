import ReactDOM from 'react-dom/client';
import '@babylonjs/inspector';      // registers BABYLON.Inspector
import '@babylonjs/node-editor';    // registers BABYLON.NodeEditor
import HavokPhysics from '@babylonjs/havok';
import App from './App';
import './index.css';

(async () => {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    const havok = await HavokPhysics();
    root.render(<App havok={havok} />);
})();
