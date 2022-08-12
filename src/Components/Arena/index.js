// index.js
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";
// フロントエンドにNFTキャラクターを表示するため、characterNFTのメタデータを渡します。
const Arena = ({ characterNFT }) => {
  // コントラクトのデータを保有する状態変数を初期化します。
  const [gameContract, setGameContract] = useState(null);

  // ボスのメタデータを保存する状態変数を初期化します。
  const [boss, setBoss] = useState(null);
  
  // 攻撃の状態を保存する変数を初期化します。
  const [attackState, setAttackState] = useState("");
  
  const [showToast, setShowToast] = useState(false);
  const runAttackAction = async () => {
    try {
      // コントラクトが呼び出されたことを確認します。
      if (gameContract) {
        // attackState の状態を attacking に設定します。
        setAttackState("attacking");
        console.log("Attacking boss...");
  
        // NFT キャラクターがボスを攻撃します。
        const attackTxn = await gameContract.attackBoss();
  
        // トランザクションがマイニングされるまで待ちます。
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
  
        // attackState の状態を hit に設定します。
        setAttackState("hit");
  
        // 攻撃ダメージの表示を true に設定し（表示）、5秒後に false に設定する（非表示）
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error attacking boss:", error);
      setAttackState("");
    }
  }; 
  
  // ページがロードされると下記が実行されます。
  useEffect(() => {
    // コントラクトからボスのメタデータを取得し、bossを設定する非同期関数 fetchBoss を設定します。
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("Boss:", bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };
    if (gameContract) {
      // コントラクトの準備ができたら、ボスのメタデータを取得します。
      fetchBoss();
    }
  }, [gameContract]);
  // ページがロードされると下記が実行されます。
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

// Arena/index.js
  return (
    <div className="arena-container">
      {/* 攻撃ダメージの通知を追加します */}
      {boss && characterNFT && (
        <div id="toast" className={showToast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}
      {/* ボスをレンダリングします */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content  ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
          {/* Attack ボタンの下にローディングマークを追加します*/}
          {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}
      {/* NFT キャラクター をレンダリングします*/}
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
          {/* <div className="active-players">
            <h2>Active Players</h2>
            <div className="players-list">{renderActivePlayersList()}</div>
          </div> */}
        </div>
      )}
    </div>
  );
};
export default Arena;