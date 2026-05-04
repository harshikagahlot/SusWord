import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { WORD_DICTIONARY } from '../wordDictionary'

export default function Reveal() {
  return (
    <div style={{color: "red", fontSize: "30px", fontWeight: "bold", padding: "50px", textAlign: "center", background: "white", minHeight: "100vh"}}>
      THIS IS REVEAL DEBUG SCREEN
    </div>
  );
}
