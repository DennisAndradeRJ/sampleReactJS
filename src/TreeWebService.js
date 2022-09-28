import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import forgerockApi from "./api/amApi";

const COMPLETE_URL = "/json/realms/root/authenticate?authIndexType=service&authIndexValue=CheckMagicLink&token=";

const TreeWebService = () => {
    const { search }  = useLocation();

    const [userEmail, setUserEmail] = useState('');
    const [tokenIdMsg, setTokenIdMsg] = useState('');
    const [errMsg, setErrMsg] = useState ('');
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const uriParams = new URLSearchParams(search);
    const tokenId = uriParams.get('token');    // Magic Link token to use in the next API call to AM to check the token and user
    const username = uriParams.get('username');   // Get the username from the URI
    const url = `${COMPLETE_URL}${tokenId}&username=${username}`

    // We are handling both registration and login with the same function. We could however handle them separately if needed. All we need to do is to parse the URI parameter
    // from the email link with the URLSearchParams (see above for the suspendedId) and do an if statement inside this useEffect to call 2 functions separately.
    useEffect(() => {
        handleSuspendedTree();
    }, [])

    const handleSuspendedTree = async () => {
        try {
            const response = await forgerockApi.post(url, null,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-API-Version': 'resource=2.1'
                    }
                }
            );
            setUserEmail('');
            setTokenIdMsg(response.data.tokenId);
            setSuccess(true);
            setSuccessMsg('Login Successful!');
            
        } catch (err) {
            setSuccess(false);
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Information');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized: User does not exist or link has expired');
            } else {
                setErrMsg('Login Failed');
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
                <style> 
                    {`
                        .my-element {
                            word-wrap: break-word;
                            font-size:12px; 
                            color:red;
                            padding-top:15px;
                        }
                        .title {
                            color: white;
                            font-size: 12px;
                        }
                    `}
                </style>
                <p className="my-element"> <b className="title">TokenId: </b>{tokenIdMsg} </p>
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

export default TreeWebService