import ReactDOM from 'react-dom/client';
import HavokPhysics from '@babylonjs/havok';
import { MeshoptCompression } from '@babylonjs/core/Meshes/Compression/meshoptCompression';
import App from './App';
import { getBasePath } from './config';
import './index.css';

// Models use EXT_meshopt_compression; load the decoder from our own host, not Babylon's CDN.
MeshoptCompression.Configuration = {
    decoder: { url: `${getBasePath()}/libs/meshopt_decoder.js` },
};

(async () => {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    const havok = await HavokPhysics();
    root.render(<App havok={havok} />);
})();
