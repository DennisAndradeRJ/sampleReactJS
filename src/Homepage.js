import { Link } from "react-router-dom";


const Homepage = () => {

    return (
        <section>
            <h1>ForgeRock ReactJS Sample App</h1>
            <hr />
            <style>
            {`
                .question {
                    padding-top:25px;
                    padding-bottom:30px;
                }
            `}
            </style>
            <p className="question">What would you like to use for this sample?</p>
            <Link to="/platformlogin">ForgeRock Platform</Link> 
            <Link to="/amlogin">Standalone AM/IDM</Link> 
        </section>        
    )
}

export default Homepage