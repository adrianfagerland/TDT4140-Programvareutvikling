import { Link } from 'react-router-dom';

import Login from '../components/Login';
import './LoginPage.css'

function LoginPage() {
    return (
        <div className='centered-container'>
            <h2>Logg inn</h2>
            <Login />
            <Link to="/createuser">
                <p>Har du ikke konto? Opprett en her!</p>
            </Link>
        </div>
    )
}

export default LoginPage;