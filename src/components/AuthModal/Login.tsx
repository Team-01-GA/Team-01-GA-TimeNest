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

function Login() {
    const [fields, setFields] = useState<loginFields>({
        email: '',
        password: '',
    });
    const { setUser } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);

    const navigate = useNavigate();

    const onLogin = (): void => {
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

        loginUser(fields.email, fields.password)
            .then((credential) => {
                setUser(credential.user);
            })
            .then(() => {
                navigate('/app');
            })
            .catch((e: unknown) => {
                if (e instanceof Error) {
                    if (e.message.includes('wrong-password')) {
                        showAlert(AlertTypes.WARNING, 'Invalid credentials.');
                        return;
                    }
                    showAlert(AlertTypes.ERROR, e.message);
                } else {
                    showAlert(AlertTypes.ERROR, String(e));
                }
            });
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
                        onChange={(e) => saveInputs('password', e.target.value)}
                    />
                </label>
                <button className='btn btn-primary btn-lg mt-4 relative'>
                    Sign in
                </button>
            </fieldset>
        </form>
    );
}

export default Login;
