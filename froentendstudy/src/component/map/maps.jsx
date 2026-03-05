import { Fragment, useEffect, useState } from "react";
import { Map } from "./kakao-maps/esm/components/Map";
import { MapMarker } from "./kakao-maps/esm/components/MapMarker";

// [기존 코드]
// const { kakao } = window;
// [수정 코드] window.kakao가 로드되지 않았을 때의 에러를 방지합니다.
const kakao = typeof window !== 'undefined' ? window.kakao : null;

const Maps = (props) => {
  const [locate, setLocate] = useState("지도를 눌러주세요.");
  const [position, setPosition] = useState();
  const [search , setSearch] = useState();

  const [info, setInfo] = useState()
  const [markers, setMarkers] = useState([])
  const [map, setMap] = useState()

  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  }

  const onChangeDetainAddress = (e) => {
    props.detailAddressData(e.target.value);
  }

  // [기존 코드]
  // var geocoder = new kakao.maps.services.Geocoder(); // 좌표로 주소 찾기
  // const ps = new kakao.maps.services.Places(); // 주소로 자표찾기
  // [수정 코드] kakao가 존재할 때만 서비스를 초기화합니다.
  const geocoder = kakao && kakao.maps ? new kakao.maps.services.Geocoder() : null;
  const ps = kakao && kakao.maps ? new kakao.maps.services.Places() : null;

  const findAddress = (lat , lng) => {
    if (!kakao || !kakao.maps || !geocoder) return;
    
    let coord = new kakao.maps.LatLng(lat, lng);
    props.locateData({locateX : coord.getLng() , locateY : coord.getLat()});

    geocoder.coord2Address(coord.getLng(), coord.getLat(), function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        setLocate(!! result[0].address ? result[0].address.address_name : "알 수 없음.");
      }
    });
  }

  useEffect(() => {
    props.addressData(locate);
  } , [locate]);

  const searchAddress = (e) => {
    if(!kakao || !kakao.maps || !ps) return;
    if(e.key === 'Enter') {
      ps.keywordSearch(search , (data, status, _pagination) => {
        if (status === kakao.maps.services.Status.OK) {
          const bounds = new kakao.maps.LatLngBounds()
          let markers = []
    
          for (var i = 0; i < data.length; i++) {
            markers.push({
              position: {
                lat: data[i].y,
                lng: data[i].x,
              },
              content: data[i].place_name,
            })
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
          }
          setMarkers(markers)
          if(map) map.setBounds(bounds)
        }
      })
    }
  }

  const currentLocation = () => {
    if (!kakao || !kakao.maps) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude,
              lon = position.coords.longitude;
          
          var locPosition = new kakao.maps.LatLng(lat, lon),
              message = '<div style="padding:5px;">여기에 계신가요?!</div>';
          
          displayMarker(locPosition, message);
        });
     } else {
      var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),    
          message = 'geolocation을 사용할수 없어요..'
          
      displayMarker(locPosition, message);
      }
    }

    function displayMarker(locPosition, message) {
      if (!kakao || !kakao.maps || !map) return;
      var marker = new kakao.maps.Marker({  
          map: map, 
          position: locPosition
      }); 
      
      var iwContent = message,
          iwRemoveable = true;
  
      var infowindow = new kakao.maps.InfoWindow({
          content : iwContent,
          removable : iwRemoveable
      });
      
      infowindow.open(map, marker);
      map.setCenter(locPosition);      
  }

  useEffect(() => {
    
  } , []);

  return (
    <Fragment>
      <input className="meetingAddressSearch" placeholder="검색할 주소를 입력 후 엔터를 눌러주세요." onChange={onChangeSearch} onKeyDown={searchAddress}/>
      {props.address === undefined ? <span className="meetingAddress">{"주소 : 지도를 눌러주세요."}</span> : <span className="meetingAddress">{"주소 : " + props.address}</span>}
      <button className="currentButton" onClick={currentLocation}>현재 위치</button>
      
      {/* kakao 객체가 로드된 경우에만 지도를 렌더링합니다. */}
      {kakao && kakao.maps ? (
        <Map
          className="IMG-newMeeting"
          center={{
            lat: 33.450701,
            lng: 126.570667,
          }}
          style={{
            width: "100%",
            height: "450px",
          }}
          onCreate={setMap}
          level={3}
          onClick={(_t, mouseEvent) => {
            findAddress(mouseEvent.latLng.getLat() , mouseEvent.latLng.getLng());
            setPosition({
              lat: mouseEvent.latLng.getLat(),
              lng: mouseEvent.latLng.getLng(),
            })
          }}
        >
          {position && <MapMarker position={position} />}
          {markers.map((marker) => (
            <MapMarker
              key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
              position={marker.position}
              onClick={() => setInfo(marker)}
            >
              {info && info.content === marker.content && (
                <div style={{color:"#000"}}>{marker.content}</div>
              )}
            </MapMarker>
          ))}
        </Map>
      ) : (
        <div style={{width: "100%", height: "450px", background: "#eee", display: "flex", justifyContent: "center", alignItems: "center"}}>
          지도를 로딩 중입니다...
        </div>
      )}
      <input className="meetingAddressInput" maxLength={20} placeholder="상세 주소를 입력해주세요." defaultValue={props.detailAddress} onChange={onChangeDetainAddress}/>
    </Fragment>
  )
}

export default Maps;