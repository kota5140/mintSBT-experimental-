"use client";
import React, { useState } from 'react';
import Link from 'next/link'; // Import Link from next/link
import axios from "axios";
import { ethers } from "ethers";
import contractConfig from "../config.js";

const Verification: React.FC = () => {
    const [tokenId, setTokenId] = useState("");
    const [verificationResult, setVerificationResult] = useState<string | null>(null);
    const [metaMaskConnected, setMetaMaskConnected] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState(""); // ここで connectedAccount を useState で宣言

    let contract: ethers.Contract;
    const connectMetaMask = async () => {
        // try {
        //     // MetaMaskに接続リクエストを送信
        //     const accounts = await window.ethereum.request({
        //         method: "eth_requestAccounts",
        //     });
        //     if (accounts.length > 0) {
        //         const connectedAccount = accounts[0];
        //         setConnectedAccount(connectedAccount); // state を更新
        //         setMetaMaskConnected(true);
        //         // 他の初期化処理などを追加する場合はここで実施
        //     }
        try {
            // Check if MetaMask is present
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                if (accounts.length > 0) {
                    const connectedAccount = accounts[0];
                    setConnectedAccount(connectedAccount);
                    setMetaMaskConnected(true);
                }
            } else {
                // Ask for user confirmation before redirecting to MetaMask Mobile installation page
                const userConfirmed = window.confirm("MetaMask not found. Would you like to install MetaMask Mobile?");

                if (userConfirmed) {
                    window.location.href = "https://portfolio.metamask.io/";
                } else {
                    // Handle the case when the user chooses not to install MetaMask Mobile
                    console.log("User chose not to install MetaMask Mobile.");
                }
            }
        } catch (error) {
            console.error("MetaMask connection error", error);
            setMetaMaskConnected(false);
        }
    };

    const verify = async () => {
        try {
            console.log("検証スタート");
            // contract
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            /* Goerliネットワーク上にあるコントラクトを使えるようにしまっせということ */
            contract = new ethers.Contract(
                contractConfig.address,
                contractConfig.abi,
                signer
            );
            console.log(metaMaskConnected);
            console.log(contract);
            if (metaMaskConnected && contract) {
                try {
                    // 入力されたSBTのidのURIを取得
                    // 失敗したらエラーをキャッチし、Token doesn't existというエラーメッセージを返す
                    await contract.tokenURI(tokenId);
                } catch (error) {
                    console.error("Error fetching token URI", error);
                    // トークンが存在しない場合
                    setVerificationResult("Token doesn't exist");
                    return;
                }
                const sbtMetadataUrl = await contract.tokenURI(tokenId);
                const response = await axios.get(sbtMetadataUrl);
                const sbtMetadata = response.data;

                // VCのメタデータをIPFSから取得
                const vcMetadataUrl = sbtMetadata.verifiableCredentials[0];
                const vcResponse = await axios.get(vcMetadataUrl);
                const vcMetadata = vcResponse.data;

                // VCデータをJSONファイルに変換
                const vcJsonString = JSON.stringify(vcMetadata);

                // VCの検証
                const didkit = await import("@spruceid/didkit-wasm");
                const proofOptions = {};
                const result = await didkit.verifyCredential(
                    vcJsonString,
                    JSON.stringify(proofOptions)
                );

                console.log(result);
                console.log(result.length);
                // 検証結果をstateにセット
                /* resultの結果が
                {"checks":["proof"],"warnings":[],"errors":["signature error: Verification equation was not satisfied"]}
                の場合は文字数が46を超えることを利用 */
                setVerificationResult(result.length > 46 ? 'Verification failed!' : 'Verified');
            } else {
                console.error("MetaMask is not connected or contract is not initialized.");
            }
        } catch (error) {
            console.error("検証エラー", error);

            // エラー時は検証結果をクリア
            setVerificationResult('Verification failed!');
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '30px' }}>VC Verification for holders</h1>
            <p>This is the page for cert holders.</p>
            {/* ↓<a></a>は要らない */}
            <Link href="/Verification_verifier">
                <h1 style={{ textDecoration: 'underline', fontSize: '15px' }}>Go to verifier&apos;s page</h1>
            </Link>
            <p><br></br></p>
            {/* Connect to MetaMask button */}
            {
                metaMaskConnected ? (
                    <div>
                        <p>Connected to MetaMask</p>
                        {/* 接続されたアカウントを表示 */}
                        <p>{connectedAccount}</p>
                    </div>
                ) : (
                    <div>
                        <button
                            style={{
                                backgroundColor: 'blue',
                                color: 'white',
                                padding: '10px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                            onClick={connectMetaMask}
                        >
                            Connect to MetaMask
                        </button><br />
                    </div>)
            }

            {/* SBTのURI入力フォーム */}
            <label>
                TokenId:
                <input
                    type="text"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    style={{
                        padding: '8px',
                        margin: '5px 0',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        color: 'black',
                    }}
                />
            </label>


            {/* 検証ボタン */}
            <button
                style={{
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                onClick={verify}
            >
                Verify
            </button>
            {/* 検証結果をブラウザに表示 */}
            {
                verificationResult !== null && (
                    <div>
                        <h2>Verification Result:</h2>
                        <p style={{ color: verificationResult === 'Verified' ? 'green' : 'red', fontSize: '30px' }}>
                            {verificationResult}
                        </p>
                    </div>
                )
            }
        </div >
    );
};

export default Verification;
