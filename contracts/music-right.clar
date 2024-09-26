;; title: music-right
;; version: 2.2
;; summary: Music Rights NFT with consistent token structure
;; description: A smart contract for managing music rights as NFTs with marketplace features and consistent token structure

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_NFT_EXISTS (err u101))
(define-constant ERR_NFT_NOT_FOUND (err u102))
(define-constant ERR_INSUFFICIENT_BALANCE (err u103))
(define-constant ERR_MINT_FAILED (err u104))
(define-constant ERR_NO_ROYALTIES_TO_CLAIM (err u105))
(define-constant ERR_TRANSFER_FAILED (err u106))
(define-constant ERR_INVALID_AMOUNT (err u107))

;; Define fungible token for royalty payments
(define-fungible-token royalty-token)

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var oracle-address principal tx-sender)

;; Updated Data Maps
(define-map tokens 
  { token-id: uint } 
  { 
    owner: principal, 
    artist: principal,
    song-title: (string-ascii 256),
    royalty-percentage: uint,
    total-shares: uint,
    uri: (string-ascii 256),
    is-for-sale: bool,
    sale-price: uint
  })

(define-map streaming-data 
  { token-id: uint } 
  { 
    total-streams: uint,
    last-updated: uint
  })

(define-map token-balances
  { token-id: uint, owner: principal }
  { balance: uint })

(define-map revenue-per-stream 
  { token-id: uint }
  { amount: uint })

;; NFT Mint Function
(define-public (mint-music-rights (artist principal) (song-title (string-ascii 256)) (royalty-percentage uint) (total-shares uint) (uri (string-ascii 256)))
  (let
    ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (is-none (map-get? tokens {token-id: token-id})) ERR_NFT_EXISTS)
    (map-set tokens
      {token-id: token-id}
      {
        owner: artist, 
        artist: artist,
        song-title: song-title,
        royalty-percentage: royalty-percentage,
        total-shares: total-shares,
        uri: uri,
        is-for-sale: false,
        sale-price: u0
      })
    (map-set token-balances
      {token-id: token-id, owner: artist}
      {balance: total-shares})
    (var-set last-token-id token-id)
    (ok token-id)))

;; Transfer Shares Function
(define-public (transfer-shares (token-id uint) (amount uint) (sender principal) (recipient principal))
  (let
    ((sender-balance (default-to {balance: u0} (map-get? token-balances {token-id: token-id, owner: sender})))
     (recipient-balance (default-to {balance: u0} (map-get? token-balances {token-id: token-id, owner: recipient})))
     (token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))
    (asserts! (>= (get balance sender-balance) amount) ERR_INSUFFICIENT_BALANCE)
    (map-set token-balances
      {token-id: token-id, owner: sender}
      {balance: (- (get balance sender-balance) amount)})
    (map-set token-balances
      {token-id: token-id, owner: recipient}
      {balance: (+ (get balance recipient-balance) amount)})
    (if (is-eq sender (get owner token))
      (map-set tokens
        {token-id: token-id}
        (merge token {owner: recipient}))
      true)
    (ok true)))

;; Distribute Royalties Function
(define-public (distribute-royalties (token-id uint) (royalty-amount uint))
  (let
    ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get artist token)) ERR_NOT_AUTHORIZED)
    (unwrap! (ft-mint? royalty-token royalty-amount tx-sender) ERR_MINT_FAILED)
    (ok true)))

;; Claim Royalties Function
(define-public (claim-royalties (token-id uint))
  (let
    ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND))
     (balance (default-to {balance: u0} (map-get? token-balances {token-id: token-id, owner: tx-sender})))
     (total-shares (get total-shares token))
     (royalty-balance (ft-get-balance royalty-token (as-contract tx-sender)))
     (share-amount (/ (* (get balance balance) royalty-balance) total-shares)))
    (asserts! (> share-amount u0) ERR_NO_ROYALTIES_TO_CLAIM)
    (match (ft-transfer? royalty-token share-amount (as-contract tx-sender) tx-sender)
      success (ok share-amount)
      error (err u1))))

;; List for Sale Function
(define-public (list-for-sale (token-id uint) (price uint))
  (let ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get owner token)) ERR_NOT_AUTHORIZED)
    (asserts! (> price u0) ERR_INVALID_AMOUNT)
    (ok (map-set tokens
      {token-id: token-id}
      (merge token {is-for-sale: true, sale-price: price})))))

;; Cancel Sale Listing Function
(define-public (cancel-sale-listing (token-id uint))
  (let ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get owner token)) ERR_NOT_AUTHORIZED)
    (ok (map-set tokens
      {token-id: token-id}
      (merge token {is-for-sale: false, sale-price: u0})))))

;; Buy NFT Function
(define-public (buy-nft (token-id uint))
  (let ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))
    (asserts! (get is-for-sale token) ERR_NOT_AUTHORIZED)
    (asserts! (is-eq (stx-transfer? (get sale-price token) tx-sender (get owner token)) (ok true)) ERR_TRANSFER_FAILED)
    (ok (map-set tokens
      {token-id: token-id}
      (merge token {owner: tx-sender, is-for-sale: false, sale-price: u0})))))

;; Set Revenue per Stream Function
(define-public (set-revenue-per-stream (token-id uint) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get oracle-address)) ERR_NOT_AUTHORIZED)
    (ok (map-set revenue-per-stream {token-id: token-id} {amount: amount}))))

;; Update Streaming Data Function
(define-public (update-streaming-data (token-id uint) (new-streams uint))
  (let ((current-data (default-to 
                        { total-streams: u0, last-updated: u0 } 
                        (map-get? streaming-data {token-id: token-id}))))
    (ok (map-set streaming-data 
      {token-id: token-id} 
      { 
        total-streams: (+ (get total-streams current-data) new-streams),
        last-updated: block-height
      }))))

;; Set Oracle Address Function
(define-public (set-oracle-address (new-address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (var-set oracle-address new-address))))

;; Read-only Functions
(define-read-only (get-token-info (token-id uint))
  (ok (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))

(define-read-only (get-share-balance (token-id uint) (owner principal))
  (ok (get balance (default-to {balance: u0} (map-get? token-balances {token-id: token-id, owner: owner})))))

(define-read-only (get-total-royalties)
  (ok (ft-get-balance royalty-token (as-contract tx-sender))))

(define-read-only (get-nft-sale-status (token-id uint))
  (let ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))
    (ok {is-for-sale: (get is-for-sale token), sale-price: (get sale-price token)})))

(define-read-only (get-revenue-per-stream (token-id uint))
  (ok (unwrap! (map-get? revenue-per-stream {token-id: token-id}) ERR_NFT_NOT_FOUND)))