import {createRoot} from 'react-dom/client';
import PublicServices37 from './PublicServices37';
import './styles.css';
createRoot(document.getElementById('root')!).render(<PublicServices37 scope={location.pathname.includes('empresas')?'company':'waitlist'}/>);
