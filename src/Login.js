import { useRef, useState, useEffect } from 'react';
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import forgerockApi from "./api/forgerockApi";
import { Link } from "react-router-dom";

const EMAIL_REGEX = /^(.+)@(.+)$/;
const LOGIN_URL = "/json/realms/root/authenticate?authIndexType=service&authIndexValue=LoginEmail";


const Login = () => {
    const emailRef = useRef();
    const errRef = useRef();

    const [emailAddress, setEmailAddress] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailAddressFocus, setEmailAddressFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');


    useEffect(() => {
        emailRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [emailAddress]);

    useEffect(() => {
        const result = EMAIL_REGEX.test(emailAddress);
        setValidEmail(result);
    }, [emailAddress])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
             // First call to Login journey
             const response1 = await forgerockApi.post(LOGIN_URL, null,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-API-Version': 'resource=2.1'
                    }
                }
            );
            response1.data.callbacks[0].input[0].value = emailAddress;

            // Callback to loginEmail journey with the user's email address to send an email to the user
            try {
                const response2 = await forgerockApi.post(LOGIN_URL, JSON.stringify(response1.data),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-API-Version': 'resource=2.1'
                        }
                    }
                );
                const tokenId = response2?.data?.callbacks[0].output[0].value;
                setEmailAddress('');
                setSuccessMsg(response2.data.callbacks[0].output[0].value);
                setSuccess(true);
            } catch (err2) {
                setErrMsg (err2);
            }
                  
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Email Address');
            } else if (err.response?.status === 401) {
                setErrMsg ('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            {success ? (
                <section>
                    <h1>{successMsg}</h1>
                    <style> 
                    {`
                        .linkStyle {
                            padding-top:25px;
                        }
                    `}
                </style>
                    <p className="linkStyle"> 
                    <Link to="/login">Go Home</Link>                
                    </p>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errRef ? "errMsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Login</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="emailAddress">
                            Email Address:
                            <span className={validEmail ? "valid" : "hide"}>
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                            <span className={validEmail || !emailAddress ? "hide" : "invalid"}>
                                <FontAwesomeIcon icon={faTimes} />
                            </span>
                        </label>
                        <input 
                            type="text"
                            id="emailAddress"
                            ref={emailRef}
                            autoComplete='off'
                            onChange={(e) => setEmailAddress(e.target.value)}
                            value={emailAddress}
                            required
                            aria-invalid={validEmail ? "false " : "true"}
                            aria-describedby="uidnote"
                            onFocus={() => setEmailAddressFocus(true)}
                            onBlur={() => setEmailAddressFocus(false)}
                        />
                        <p id="uidnote" className={emailAddressFocus && emailAddress && !validEmail ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            You must enter a valid email address.
                        </p>
                        <button disabled={!validEmail ? true : false}>Login</button>   
                    </form>
                    <p>
                        Need an Account? <br />
                        <span className="line">
                            <Link to="/register">Register</Link>                
                        </span>
                    </p>
                </section>
            )}
        </>
    )
}

export default Login