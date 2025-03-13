import React, { useState } from 'react';
import { Route,Routes, useNavigate } from 'react-router-dom'; // Assuming you're using React Router
import { Home } from '../../pages';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/vendors/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('vendorId', data.vendorId);
                localStorage.setItem('authToken', data.token);
                // Redirect to the Home component
                navigate('/home'); //  <---  This assumes your Home component is routed to "/"
            } else {
                navigate('/home');
                // setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred during login. Please try again later.');
            console.error(err);
        }
    };

    return (
        // Still to work on the styling
        <div className=''>
            <h2>Vendor Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                <Routes>
                    <Route path = "/home" element = {<Home />} />
                </Routes>
            </form>
        </div>
    );
}

export default Login;