import React from "react";
import { Link } from "react-router-dom";
import defaultALT from '../../_image/defaultALT.png'

const Postcontent = ({ data }) => {

    // [기존 코드]
    // if(data === null) {
    
    // [수정 코드] undefined까지 한꺼번에 잡기 위해 !data를 사용하거나 둘 다 체크합니다.
    if(data === null || data === undefined) {
        return(
            <div>
                {/* 데이터가 로딩 중일 때 표시될 빈 화면 */}
            </div>
        )
    }

    return (
        // data가 확실히 있을 때만 map이 실행됩니다.
        data.map(posts => (
            <Link to={`/viewpost/${posts.numbers}`} className="linktopost" key={posts.numbers}>
                <div className="noticedescription userPost">
                    <span>{posts.numbers}</span>
                    <span>{posts.title} <div style={{color: "rgb(60,172,255)", display:"inline"}}>{posts.count ? "["+ posts.count + "] ": null}</div></span>
                    <span><img src={posts.writerImage || defaultALT} className="profileImageData" alt="img"/> {posts.writerIsDelete ? "탈퇴한 사용자" : posts.writer}</span>
                    <span>{posts.postDate}</span>
                    <span>{posts.likes}</span>
                    <span>{posts.views}</span>
                </div>
            </Link>
        ))
    );
};

export default React.memo(Postcontent);