import { useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import forgerockApi from "./api/idmApi";

const COMPLETE_URL = "openidm/selfservice/registration?_action=submitRequirements";

const StageWebService = () => {
    const { search }  = useLocation();

    const [userEmail, setUserEmail] = useState('');
    const [errMsg, setErrMsg] = useState ('');
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const uriParams = new URLSearchParams(search);
    const idmToken = uriParams.get('token');    // token to use in the next API call to IDM and continue the registration stage
    const idmCode = uriParams.get('code');      // Code to use in the next API call to IDM and continue the registration stage

    
    useEffect(() => {
        handleEmailConfirmationLink();
    }, [])

    const handleEmailConfirmationLink = async () => {
        try {
            const body = '{"input":{ "token":"' + idmToken + '", "code":"' + idmCode + '"}, "token":"' + idmToken + '"}'
            const response = await forgerockApi.post(COMPLETE_URL, body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-OpenIDM-Username': 'anonymous',
                        'X-OpenIDM-Password': 'anonymous'
                    }
                }
            );
            setUserEmail('');
            setSuccess(true);
            setSuccessMsg('Registration completed successfuly!');

        } catch (err) {
            setSuccess(false);
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Information');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Registration Failed: ' + err.response.data.message);
            }
        }
    }
    return (
        <>
        {success ? (
            <section>
                <h1> {successMsg} </h1><br />
                <br />
                <hr></hr>
                
                <p>
                    <a href="#">Go Home</a>
                </p>
            </section>
            
        ) : (
            <h1> {errMsg} </h1>
        )}
        </>     
    )

}

export default StageWebService