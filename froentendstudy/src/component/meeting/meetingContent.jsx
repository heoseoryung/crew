import '../../_style/meeting/meetingContent.css'

/**
 * MeetingContent 컴포넌트
 * @param {Function} showDetail - 모임 상세 정보를 보여주기 위한 부모 컴포넌트의 함수
 * @param {Array} data - 백엔드에서 받아온 모임 객체 리스트 (배열)
 */
const MeetingContent = ({ showDetail, data }) => {
  
  // --- [1. 방어 코드 (Safety Check)] ---
  // 처음에 데이터가 아직 로딩 중이거나 없을 경우를 대비함
  // data가 없는데 .map()을 돌리면 바로 에러가 나기 때문에 꼭 필요한 처리!
  if (data === undefined || data === null) {
    return (
      <div>데이터를 불러오는 중입니다...</div>
    )
  }

  // --- [2. 목록 렌더링 (map)] ---
  
   return (
    /* [기존 코드] 
    data.map(posts => ( ... ))
    */

    /* [수정 코드] 
       data가 배열인지 100% 확인하고, 배열이 아니면 빈 배열([])을 써서 map을 돌립니다. 
       이렇게 하면 에러가 절대 나지 않습니다.
    */
    (Array.isArray(data) ? data : []).map(posts => (
      <div className="overlap-group-2" key={posts.meetingId} onClick={() => showDetail(posts.meetingId)}>
        
        {/* 모임 대표 이미지 섹션 */}
        <div className="imageSession">
          <img className="mask-group" alt="모임 이미지" src={posts.meetingImage} />
        </div>
        
        {/* 디자인용 배경 레이어 */}
        <div className="rectangle-2" />
        
        {/* 모임 설명 (짧은 소개글) */}
        <div className="text-wrapper-3">{posts.description}</div>
        
        {/* 모임 장소 주소 정보 */}
        <div className="text-wrapper-4">
          {posts.address} <br/> {posts.detailAddress}
        </div>
        
        {/* 참여 인원 현황 (현재 인원 / 최대 정원) */}
        <div className="text-wrapper-5">
          참여자 수 {posts.nowParticipants} / {posts.maxParticipants}
        </div>
        
        {/* 모임 제목 */}
        <div className="text-wrapper-6">{posts.title}</div>
        
      </div>
    ))
  )
}

export default MeetingContent;