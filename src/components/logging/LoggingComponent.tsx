import { useEffect } from "react"
import "./loggingComponent.css";


export default function LoggingComponent() {
    useEffect(() => {
        console.log("Logger init");
        return () => {
            
        };
    }, []);

    return (
        <div className="logging"></div>
    )
}