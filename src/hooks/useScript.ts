import {useEffect, useState} from "react";

interface ParamsProps{
    url: string | null,
    theme: string,
    issueTerm: string,
    repo: string,
    ref: any,
    thisUrlPath: string,
}


const useScript = (params: ParamsProps) => {
    const { url, theme, issueTerm, repo, thisUrlPath } = params

    useEffect(() => {

        const utterances = document.getElementsByClassName('utterances')[0]

        if(utterances){
            utterances.remove()
            console.log('utterances removed')
        }

        let anchor = document.getElementById("commentDiv")
        let script = document.createElement("script")
        script.src = url;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.setAttribute("theme", theme)
        script.setAttribute("issue-term", issueTerm)
        script.setAttribute("repo", repo)

        anchor.appendChild(script)
    }, [thisUrlPath])
}

export default useScript;