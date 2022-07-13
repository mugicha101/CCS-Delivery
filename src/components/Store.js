import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Store({isLoaded, user}) {
    let navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !user) {
            navigate("..", {replace: true});
        }
    }, [isLoaded, user])
    

    return (<div>
        <h2>store</h2>
    </div>)
}

export default Store;