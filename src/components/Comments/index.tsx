import styles from "./comments.module.scss"
import { useEffect, useRef } from "react"
import useScript from "../../hooks/useScript"

export default function Comments(props){
    const {thisUrlPath} = props

    const comment = useRef<HTMLInputElement>(null)

    useScript({
        url: "https://utteranc.es/client.js",
        repo: "LucasSousa09/SpaceTravelling2.0",
        issueTerm: "pathname",
        theme: "github-dark",
        ref: comment,
        thisUrlPath
    })

    return (
        <div className={styles.commentsContainer} >
            {
                <div id="commentDiv" ref={comment}></div>
            }
        </div>
    )
}