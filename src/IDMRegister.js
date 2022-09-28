import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import forgerockApi from "./api/idmApi";
import { Link } from "react-router-dom";


const EMAIL_REGEX = /^(.+)@(.+)$/;
const REGISTER_URL = "/openidm/selfservice/registration?_action=submitRequirements";

const IDMRegister = () => {
    const emailRef = useRef();
    const errRef = useRef();

    const [emailAddress, setEmailAddress] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailAddressFocus, setEmailAddressFocus] = useState(false);

    const [errMsg, setErrMsg] = useState ('');
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        emailRef.current.focus();
    }, [])

    useEffect(() => {
        const result = EMAIL_REGEX.test(emailAddress);
        setValidEmail(result);
    }, [emailAddress])

    useEffect(() => {
        setErrMsg('');
    }, [emailAddress])



    const handleSubmit = async (e) => {
        e.preventDefault();
        // if button enabled with JS hack
        const v1 = EMAIL_REGEX.test(emailAddress);
        if (!v1) {
            setErrMsg("Invalid Entry");
            return;
        }
        var body1 = '{"input":{"input":{}}}'
        try {
            // First call to the Registration stage
            const response1 = await forgerockApi.post(REGISTER_URL, body1,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-OpenIDM-Username': 'anonymous',
                        'X-OpenIDM-Password': 'anonymous'
                    }
                }
            );
            const idmToken = response1.data.token;
            
            // Callback to registration stage with the user's email address to send an email to the user
            try {
                const body2 = '{ "input": { "user": { "userName": "' + emailAddress + '", "givenName": " ", "sn": " ", "mail":"' + emailAddress + '", "preferences":{"updates":false, "marketing":false} }}, "token": "' + idmToken + '"}';
                const response2 = await forgerockApi.post(REGISTER_URL, body2,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-OpenIDM-Username': 'anonymous',
                            'X-OpenIDM-Password': 'anonymous'
                        }
                    }
                );
                setSuccessMsg(response2.data.requirements.description);
                setSuccess(true);
            } catch (err2) {
                setErrMsg (err2);
            }

    
            
            // Clear the input fields if needed
        } catch (err1) {
            if (!err1?.response1) {
                setErrMsg('No Server Response');
            } else {
                setErrMsg ('Registration Failed')
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
                    <Link to="/">Go Home</Link>                
                    </p>
            </section>
        ) : (
        <section>
            <p ref={errRef} className={errRef ? "errMsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>IDM Register</h1>
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
                    autoComplete="off"
                    onChange={(e) => setEmailAddress(e.target.value)}
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
                <button disabled={!validEmail ? true : false}>Register</button>
                <p>
                    Already registered? <br />
                    <span className="line">
                        <Link to="/amlogin">Login</Link>                
                    </span>
                </p>
            </form>
        </section>
        )}
        </>
    )
}

export default IDMRegister