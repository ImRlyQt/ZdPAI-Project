import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../api";
import "../styles/profile.scss";
import "../styles/globals.scss";

export default function Profile(){
  const { user, token, logout } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const viewedUserId = params.userId ? Number(params.userId) : (user?.id || 0);
  const isPublic = !user || (viewedUserId !== user.id);
  const isAdmin = !!user?.is_admin;

  const [nick, setNick] = useState(user?.nick || "");
  const [cards, setCards] = useState([]);
  const [total, setTotal] = useState(0);
  const [profileNotFound, setProfileNotFound] = useState(false);

  // Profile search
  const [profileQ, setProfileQ] = useState("");
  const [profileResults, setProfileResults] = useState([]);
  useEffect(()=>{
    const t = setTimeout(async ()=>{
      const q = profileQ.trim();
      if (!q) { setProfileResults([]); return; }
      const r = await apiGet("/profiles/search", token, { q });
      const data = await r.json();
      setProfileResults(data);
    }, 250);
    return ()=>clearTimeout(t);
  }, [profileQ, token]);

  // Cards search
  const [cardQ, setCardQ] = useState("");
  const [cardResults, setCardResults] = useState([]);
  useEffect(()=>{
    const t = setTimeout(async ()=>{
      const q = cardQ.trim();
      if (!q) { setCardResults([]); return; }
      const r = await apiGet("/cards/search", token, { q });
      const data = await r.json();
      setCardResults(Array.isArray(data) ? data : []);
    }, 300);
    return ()=>clearTimeout(t);
  }, [cardQ, token]);

  async function addCard(card){
    const payload = (isAdmin && isPublic) ? { ...card, user_id: viewedUserId } : card;
    const r = await apiPost("/cards/add", token, payload);
    if (r.ok) {
      loadCards();
      setCardQ("");
      setCardResults([]);
    }
  }
  async function removeCard(cardId){
    const payload = (isAdmin && isPublic) ? { card_id: cardId, user_id: viewedUserId } : { card_id: cardId };
    const r = await apiPost("/cards/remove", token, payload);
    if (r.ok) loadCards();
  }

  async function loadCards(){
    let r;
    try {
      if (isAdmin && isPublic) {
        r = await apiGet("/cards", token, { user_id: viewedUserId });
      } else if (isPublic) {
        r = await apiGet(`/profiles/${viewedUserId}/cards`);
      } else {
        r = await apiGet("/cards", token);
      }
      if (!r.ok) {
        if (isPublic && r.status === 404) setProfileNotFound(true);
        setCards([]); setTotal(0); return;
      }
      const data = await r.json();
      setCards(Array.isArray(data) ? data : []);
      setTotal(Array.isArray(data) ? data.reduce((s,c)=>s+(Number(c.quantity)||1),0) : 0);
    } catch {
      setCards([]);
      setTotal(0);
    }
  }

  useEffect(()=>{ loadCards(); }, [viewedUserId]);

  // Load displayed profile nick when switching views
  useEffect(()=>{
    async function loadNick(){
      setProfileNotFound(false);
      if (!isPublic) { setNick(user?.nick || ""); return; }
      if (!viewedUserId) { setNick("Public profile"); return; }
      try {
        const r = await apiGet(`/profiles/${viewedUserId}`, token);
        if (r.status === 404) { setProfileNotFound(true); setNick("Profile not found"); return; }
        if (!r.ok) { setNick("Public profile"); return; }
        const data = await r.json();
        setNick(data?.nick || "Public profile");
      } catch {
        setNick("Public profile");
      }
    }
    loadNick();
  }, [isPublic, viewedUserId, user?.nick, token]);

  function logoutClick(){ logout(); navigate("/login"); }

  // Delete account
  const [showDel, setShowDel] = useState(false);
  async function confirmDelete(){
    const body = (isAdmin && isPublic) ? { user_id: viewedUserId } : {};
    const r = await apiPost("/account/delete", token, body);
    if (r.ok) {
      setShowDel(false);
      if (isAdmin && isPublic) navigate("/profile"); else logoutClick();
    }
  }

  return (
    <>
      <header>
        <h1 className="logo">DeckHeaven</h1>
        <div className="search-bar" style={{position:"relative"}}>
          <input type="text" value={profileQ} onChange={e=>setProfileQ(e.target.value)} placeholder="Search Profiles" autoComplete="off" />
          <i className="fa fa-search" />
          {profileResults?.length > 0 && (
            <div style={{position:"absolute", top:"110%", left:0, width:"100%", background:"#222", borderRadius:"0 0 1rem 1rem", zIndex:10, maxHeight:200, overflowY:"auto"}}>
              {profileResults.map(u => (
                <div key={u.id} style={{padding:"0.5rem", cursor:"pointer", color:"#fff"}}
                     onMouseOver={e=>e.currentTarget.style.background="#333"}
                     onMouseOut={e=>e.currentTarget.style.background=""}
                     onClick={()=>{ setProfileQ(""); setProfileResults([]); navigate(`/profile/${u.id}`); }}>{u.nick}</div>
              ))}
            </div>
          )}
        </div>
        {!isPublic ? (
          <div style={{display:"flex", alignItems:"center"}}>
            <a className="logout-btn" onClick={logoutClick} title="Log out">Log out</a>
            <button className="danger-btn" type="button" title="Delete account" onClick={()=>setShowDel(true)}>Delete account</button>
          </div>
        ) : user ? (
          <div style={{display:"flex", alignItems:"center"}}>
            <a className="back-btn" onClick={()=>navigate("/profile")} title="Back to my profile">Back to my profile</a>
            {isAdmin && (<button className="danger-btn" type="button" title="Delete this account" onClick={()=>setShowDel(true)}>Delete this account</button>)}
          </div>
        ) : null}
      </header>
      <div className="layout">
        <aside className="sidebar">
          <img src="https://avatars.githubusercontent.com/u/583231?v=4" alt="Profile" />
          <h2>{profileNotFound ? "Profile not found" : (nick || (isPublic ? "Public profile" : "Profile"))}</h2>
          <p>{profileNotFound ? "No user exists with this id." : (isPublic ? "This is a public profile." : "Welcome to your profile!")}</p>
          <div id="card-count" className="card-count" aria-live="polite">Cards: {total}</div>
          {(!isPublic || isAdmin) && (
            <div className="search-bar" style={{position:"relative"}}>
              <input type="text" value={cardQ} onChange={e=>setCardQ(e.target.value)} placeholder="Search cards" autoComplete="off" />
              <i className="fa fa-search" />
              {cardResults?.length > 0 && (
                <div style={{position:"absolute", top:"110%", left:0, width:"100%", background:"#222", borderRadius:"0 0 1rem 1rem", zIndex:10, maxHeight:260, overflowY:"auto"}}>
                  {cardResults.map(c => (
                    <div key={c.id||c.name} style={{display:"flex", alignItems:"center", padding:"0.5rem", gap:8, cursor:"pointer", color:"#fff"}}
                         onMouseOver={e=>e.currentTarget.style.background="#333"}
                         onMouseOut={e=>e.currentTarget.style.background=""}
                         onClick={()=>addCard(c)}>
                      {c.image && (<img src={c.image} style={{height:40, borderRadius:4, marginRight:8}} />)}
                      <div>
                        <div style={{fontWeight:600}}>{c.name}</div>
                        <div style={{color:"#aaa", fontSize:"0.8rem"}}>{c.setName||""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
        <main className="content">
          <div id="my-cards" className="cards-grid">
            {profileNotFound ? (
              <div style={{color:"#aaa"}}>This profile does not exist. Please choose another user.</div>
            ) : cards.length === 0 ? (
              <div style={{color:"#aaa"}}>No cards yet. Search above to add some.</div>
            ) : cards.map(c => {
              const src = c.image_url || (c.multiverseid ? `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${c.multiverseid}&type=card` : "");
              const removeBtn = (!isPublic || isAdmin) ? (
                <div className='remove-btn' title='Remove' aria-label='Remove' onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); removeCard(c.card_id); }}>&times;</div>
              ) : null;
              return (
                <div key={c.id} className='card-thumb' style={{position:"relative"}}>
                  <img src={src} alt={c.name} style={{display:"block", width:"100%", borderRadius:"0.5rem"}} />
                  <span className='qty-badge'>x{c.quantity||1}</span>
                  {removeBtn}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {(!isPublic || isAdmin) && showDel && (
        <div id="delete-modal" className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={e=>{ if(e.target.id==="delete-modal") setShowDel(false); }}>
          <div className="modal">
            <header>
              <div id="del-title">Delete account</div>
              <button className="btn cancel" type="button" aria-label="Close" onClick={()=>setShowDel(false)}>✕</button>
            </header>
            <div className="body">
              This action is permanent. The account and all saved cards will be deleted. Are you sure you want to continue?
            </div>
            <div className="actions">
              <button className="btn cancel" type="button" onClick={()=>setShowDel(false)}>Cancel</button>
              <button className="btn danger" type="button" onClick={confirmDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
