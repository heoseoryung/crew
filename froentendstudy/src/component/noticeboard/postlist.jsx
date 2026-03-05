/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import Postcontent from "./postlistcontent.jsx";
import PostPointer from "./postpagenation.jsx";
import qs from 'qs';
import { Link, useSearchParams } from "react-router-dom";

const NoticeList = () => {
    const [searchParams , setSearchParams] = useSearchParams();

    const query = qs.parse(window.location.search, { 
        ignoreQueryPrefix: true
    });
    
    const maxPages = useRef(1);
    const [postAll, setPostAll] = useState([]); 
    const [pages, setPages] = useState(1); 
    const [totalPost, setTotalPost] = useState(0); 
    
    const searchDataInput = async (e) => {
        if (e.key == 'Enter') {
            if (e.target.value !== '') {
                window.location.replace(`/noticelist?type=search&data=${e.target.value}`);
                setPages(0);
            } else {
                getPost();
            }
        }
    }

    const getPost = async () => { 
        const getPostResult = await axios({ 
            method: "GET",
            mode: "cors",
            url: `/posts?page=${pages - 1}&size=10`,
        });
        setPostAll(getPostResult.data.data); 

        const result = await axios({
            method: "GET",
            mode: "cors",
            url: `/posts/count?type=normal`,
        });
        setTotalPost(result.data.data);
    };

    const tagSearch = async () => { 
        if (query.tag === '') {
            window.location.replace("/noticelist");
            return;
        } else {
            await axios({
                method: "GET",
                mode: "cors",
                url: `/posts/search/tags/${searchParams.get("data")}?page=${pages - 1}&size=10`
            })
            .then((response) => { setPostAll(response.data.data) }) 
            .catch((e) => alert(e.response.data.message));

            await axios({
                method: "GET",
                mode: "cors",
                url: `/posts/count?type=tag&data=${searchParams.get("data")}`
            })
            .then((response) => { setTotalPost(response.data.data) }) 
            .catch((e) => alert(e.response.data.message));
        }
    }

    const setNowPages = async (value) => {
        setPages(value);
    }

    /* [잘못된 코딩 주석처리]
       이유: useEffect의 첫 번째 인자 함수에 직접 async를 붙이면 Promise를 반환하게 되어 리액트가 에러를 냅니다.
       
    useEffect(async () => {
            if(searchParams.get("type") == "search") { 
                await axios({ 
                    method: "GET",
                    mode: "cors",
                    url: `/posts/search/${searchParams.get("data")}?page=${pages - 1}&size=10`,
                })
                .then(async (response) => { 
                    setPostAll(response.data.data)
                    await axios({
                        method: "GET",
                        mode: "cors",
                        url: `/posts/count?type=search&data=${searchParams.get("data")}`
                    })
                    .then((response) => { setTotalPost(response.data.data) }) 
                    .catch((e) => alert(e.response.data.message));
                 }) 
                .catch((e) => alert(e.response.data.message));
            }
            else if (searchParams.get("type") == "tag") {
                tagSearch();
            }
            else {
                getPost();
            }

    }, [pages]); 
    */

    // [수정된 코딩] : async를 내부 함수로 옮겨서 리액트 생명주기에 맞게 변경했습니다.
    useEffect(() => {
        const fetchNoticeData = async () => {
            if(searchParams.get("type") == "search") { 
                await axios({ 
                    method: "GET",
                    mode: "cors",
                    url: `/posts/search/${searchParams.get("data")}?page=${pages - 1}&size=10`,
                })
                .then(async (response) => { 
                    setPostAll(response.data.data)
                    await axios({
                        method: "GET",
                        mode: "cors",
                        url: `/posts/count?type=search&data=${searchParams.get("data")}`
                    })
                    .then((response) => { setTotalPost(response.data.data) }) 
                    .catch((e) => alert(e.response.data.message));
                 }) 
                .catch((e) => alert(e.response.data.message));
            }
            else if (searchParams.get("type") == "tag") {
                tagSearch();
            }
            else {
                getPost();
            }
        };

        fetchNoticeData();
    }, [pages]);

    const gotoNext = () => {
        if (pages < maxPages.current) {
            setPages(parseInt(pages) + 1);
        }
    }

    const gotoPrevious = () => {
        if (pages > 1) {
            setPages(parseInt(pages) - 1);
        }
    }

    const pushData = () => {
        maxPages.current = Math.ceil(totalPost / 10);
        const arrs = [];
        for (let i = 1; i <= maxPages.current; i++) {
            arrs.push([i]);
        }
        return <PostPointer pages={arrs} nowPage={pages} setPage={setNowPages} />
    }

    return (
        <section className="sectionArea setresponsible">
            <article className="noticeFrameArea setresponsiblearticle">
                <div className="freeNotice">
                    <div className="pagedesc">게시판</div>
                    <div className="searchCoordinate">
                        <input type="text" className="searchingArea" placeholder='검색할 제목 및 내용' onKeyDown={searchDataInput} />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-search search-icon" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </div>
                </div>
                <div className="PostArea">
                    <div className="noticedescription">
                        <span id="DescHead">번호</span>
                        <span id="DescHead">제목</span>
                        <span id="DescHead">작성자</span>
                        <span id="DescHead">작성일</span>
                        <span id="DescHead">추천</span>
                        <span id="DescHead">조회수</span>
                    </div>
                    <Postcontent data={postAll} />
                </div>
                <nav aria-label="Page navigation example" className="pagenations">
                    <ul className="pagination">
                        <li className="page-item"><a className="page-link" href="#" onClick={gotoPrevious} style={{ boxShadow: "none" }}>&lt;</a></li>
                        {pushData()}
                        <li className="page-item"><a className="page-link" href="#" onClick={gotoNext} style={{ boxShadow: "none" }}>&gt;</a></li>
                    </ul>
                    <Link to={'/newpost'} className="newPost_post">New Post</Link>
                </nav>
            </article>
        </section>
    )
}

export default React.memo(NoticeList);