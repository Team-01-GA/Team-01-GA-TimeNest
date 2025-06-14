import { useContext, useState } from 'react';
import UserContext from '../../providers/UserContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import AlertContext from '../../providers/AlertContext';
import { AlertTypes } from '../../constants/alert.constants';

type loginFields = {
    email: string;
    password: string;
};

function Login({ loading, setLoading }: { loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>>; }) {
    const [fields, setFields] = useState<loginFields>({
        email: '',
        password: '',
    });

    const { setUser } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);

    const navigate = useNavigate();

    const onLogin = async (): Promise<void> => {
        try {
            setLoading(true);
            if (
                !fields.email ||
                !fields.email.includes('@') ||
                !fields.email.includes('.')
            ) {
                showAlert(
                    AlertTypes.WARNING,
                    'Please provide a valid email address.'
                );
                return;
            }
            if (!fields.password) {
                showAlert(AlertTypes.WARNING, 'Please provide a password.');
                return;
            }
    
            const credential = await loginUser(fields.email, fields.password);
            
            setUser(credential.user);

            navigate('/app');
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('wrong-password') || error.message.includes('invalid-credential')) {
                    showAlert(AlertTypes.WARNING, 'Invalid credentials.');
                    return;
                }
                showAlert(AlertTypes.ERROR, error.message);
            } else {
                showAlert(AlertTypes.ERROR, String(error));
            }
        }
        finally {
            setLoading(false);
        }
    };

    const saveInputs = (field: string, value: string): void => {
        setFields({
            ...fields,
            [field]: value,
        });
    };

    return (
        <form onSubmit={e => {
            e.preventDefault();
            onLogin();
        }}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 gap-4">
                <label className="floating-label">
                    <span>Email</span>
                    <input
                        className="input input-lg w-full"
                        placeholder="johndoe@timenest.com"
                        name="email"
                        type="email"
                        autoComplete='email'
                        value={fields.email}
                        disabled={loading}
                        onChange={(e) => saveInputs('email', e.target.value)}
                    />
                </label>
                <label className="floating-label">
                    <span>Password</span>
                    <input
                        className="input input-lg w-full"
                        placeholder="12345678"
                        name="password"
                        type="password"
                        autoComplete='current-password'
                        value={fields.password}
                        disabled={loading}
                        onChange={(e) => saveInputs('password', e.target.value)}
                    />
                </label>
                <button className='btn btn-primary btn-lg mt-4 relative' disabled={loading}>
                    Sign in
                </button>
            </fieldset>
        </form>
    );
}

export default Login;
