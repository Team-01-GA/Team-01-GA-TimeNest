import { useContext, useState } from 'react';
import UserContext from '../../providers/UserContext';
import { createUserObject, getUserByEmail, getUserByHandle } from '../../services/users.service';
import { registerUser } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import AlertContext from '../../providers/AlertContext';
import { AlertTypes } from '../../constants/alert.constants';

type registerFields = {
    firstName: string;
    lastName: string;
    handle: string;
    email: string;
    password: string;
    number: string;
};

const NAME_MIN_LENGTH: number = 1;
const NAME_MAX_LENGTH: number = 30;

const HANDLE_MIN_LENGTH: number = 3;
const HANDLE_MAX_LENGTH: number = 30;

const PASS_MIN_LENGTH: number = 8;
const PASS_MAX_LENGTH: number = 30;

const NUMBER_MIN_LENGTH: number = 1;
const NUMBER_MAX_LENGTH: number = 10;

function Register() {

    const [ fields, setFields ] = useState<registerFields>({
        firstName: '',
        lastName: '',
        handle: '',
        email: '',
        password: '',
        number: ''
    });
    const { setUser } = useContext(UserContext);
    const { showAlert } = useContext(AlertContext);

    const navigate = useNavigate();

    function isValidPassword(password: string): boolean {
        const hasNumber = /\d/.test(password); // digit
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password); // symbol
        const passLength = password.length >= PASS_MIN_LENGTH && password.length <= PASS_MAX_LENGTH;
        return hasNumber && hasSymbol && passLength;
    }

    const onRegister = async () => {
        if (!fields.firstName || fields.firstName.includes(' ') || /\d/.test(fields.firstName) || fields.firstName.length < NAME_MIN_LENGTH || fields.firstName.length > NAME_MAX_LENGTH) {
            showAlert(AlertTypes.WARNING, 'First name must be between 1 and 30 characters, without spaces or digits.');
            return;
        }
        if (!fields.lastName || fields.lastName.includes(' ') || /\d/.test(fields.lastName) || fields.lastName.length < NAME_MIN_LENGTH || fields.lastName.length > NAME_MAX_LENGTH) {
            showAlert(AlertTypes.WARNING, 'Last name must be between 1 and 30 characters, without spaces or digits.');
            return;
        }
        if (!fields.handle || fields.handle.includes(' ') || fields.handle.length < HANDLE_MIN_LENGTH || fields.handle.length > HANDLE_MAX_LENGTH || fields.handle === '_init') {
            showAlert(AlertTypes.WARNING, 'Username must be between 3 and 30 characters, without spaces.');
            return;
        }
        if (!fields.email || fields.email.includes(' ') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
            showAlert(AlertTypes.WARNING, 'Please enter a valid email address.');
            return;
        }
        if (!fields.number || fields.number.includes(' ') || fields.number.length < NUMBER_MIN_LENGTH || fields.number.length > NUMBER_MAX_LENGTH) {
            showAlert(AlertTypes.WARNING, 'Please enter a valid phone number.');
            return;
        }
        if (!fields.password || fields.password.includes(' ') || !isValidPassword(fields.password)) {
            showAlert(AlertTypes.WARNING, 'Password must be between 8 and 30 characters, with at least one symbol and one number, without spaces.');
            return;
        }

        const normalisedEmail = fields.email.toLowerCase();
        const normalisedHandle = fields.handle.toLowerCase();

        try {
            const handleSnapshot = await getUserByHandle(normalisedHandle);
            if (handleSnapshot) {
                throw new Error(`Username ${normalisedHandle} has already been taken.`);
            }

            const emailSnapshot = await getUserByEmail(normalisedEmail);
            if (emailSnapshot) {
                throw new Error(`Email ${normalisedEmail} has already been taken.`);
            }

            const credential = await registerUser(normalisedEmail, fields.password);

            await createUserObject(fields.firstName, fields.lastName, normalisedHandle, credential.user.uid, credential.user.email, fields.number);

            setUser(credential.user);

            navigate('/app');
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                showAlert(AlertTypes.ERROR, e.message);
            } else {
                showAlert(AlertTypes.ERROR, String(e));
            }
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
            onRegister();
        }}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 gap-4">
                <div className='flex flex-row gap-2 w-full'>
                    <label className="floating-label w-1/2">
                        <span>First name</span>
                        <input className="input input-lg" name='given-name' placeholder='John' type="text" autoComplete='given-name' value={fields.firstName} onChange={e => saveInputs('firstName', e.target.value)}/>
                    </label>
                    <label className="floating-label w-1/2">
                        <span>Last name</span>
                        <input className="input input-lg" name='family-name' placeholder='Doe' type="text" autoComplete='family-name' value={fields.lastName} onChange={e => saveInputs('lastName', e.target.value)}/>
                    </label>
                </div>
                <label className="floating-label">
                    <span>Username</span>
                    <input className="input input-lg w-full" name='username' placeholder='johnthedoe123' type="text" autoComplete='username' value={fields.handle} onChange={e => saveInputs('handle', e.target.value)}/>
                </label>
                <label className="floating-label">
                    <span>Email</span>
                    <input className="input input-lg w-full" name='email' placeholder='johndoe@timenest.com' type="email" autoComplete='email' value={fields.email} onChange={e => saveInputs('email', e.target.value)}/>
                </label>
                <label className="floating-label">
                    <span>Phone number</span>
                    <input className="input input-lg w-full" name='tel' placeholder='0888888888' type="tel" autoComplete='tel' value={fields.number} onChange={e => saveInputs('number', e.target.value)}/>
                </label>
                <label className="floating-label">
                    <span>Password</span>
                    <input className="input input-lg w-full" name='new-password' placeholder='1234567' type="password" autoComplete='new-password' value={fields.password} onChange={e => saveInputs('password', e.target.value)}/>
                </label>
                <button className='btn btn-primary btn-lg mt-4 relative' type='submit'>
                    Sign up
                </button>
            </fieldset>
        </form>
    );
};

export default Register;
