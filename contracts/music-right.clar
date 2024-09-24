
;; title: music-right
;; version:
;; summary:
;; description:

;; Music Rights NFT

(define-data-var oracle-address principal tx-sender)


;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_NFT_EXISTS (err u101))
(define-constant ERR_NFT_NOT_FOUND (err u102))
(define-constant ERR_INSUFFICIENT_BALANCE (err u103))
(define-constant ERR_MINT_FAILED (err u102))
(define-constant ERR_NO_ROYALTIES_TO_CLAIM (err u103))
(define-constant ERR_TRANSFER_FAILED (err u104))




;; Define fungible token for royalty payments
(define-fungible-token royalty-token)

;; Data Variables
(define-data-var last-token-id uint u0)

;; Data Maps
(define-map tokens 
  { token-id: uint } 
  { 
    owner: principal, 
    artist: principal,
    song-title: (string-ascii 256),
    royalty-percentage: uint,
    total-shares: uint,
    uri: (string-ascii 256)
  })
;; Define the streaming-data map
(define-map streaming-data 
  { token-id: uint } 
  { 
    total-streams: uint,
    last-updated: uint
  }
)

(define-map token-balances
  { token-id: uint, owner: principal }
  { balance: uint })

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
        uri: uri
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
     (recipient-balance (default-to {balance: u0} (map-get? token-balances {token-id: token-id, owner: recipient}))))
    (asserts! (>= (get balance sender-balance) amount) ERR_INSUFFICIENT_BALANCE)
    (map-set token-balances
      {token-id: token-id, owner: sender}
      {balance: (- (get balance sender-balance) amount)})
    (map-set token-balances
      {token-id: token-id, owner: recipient}
      {balance: (+ (get balance recipient-balance) amount)})
    (ok true)))

;; Distribute Royalties Function
(define-public (distribute-royalties (token-id uint) (royalty-amount uint))
  (let
    ((token (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND))
     (total-shares (get total-shares token)))
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
      error (err u1)))) ;; Use a uint error code instead of ERR_TRANSFER_FAILED


;; Get Token Info
(define-read-only (get-token-info (token-id uint))
  (ok (unwrap! (map-get? tokens {token-id: token-id}) ERR_NFT_NOT_FOUND)))

;; Get Share Balance
(define-read-only (get-share-balance (token-id uint) (owner principal))
  (ok (get balance (default-to {balance: u0} (map-get? token-balances {token-id: token-id, owner: owner})))))

;; Get Total Royalties
(define-read-only (get-total-royalties)
  (ok (ft-get-balance royalty-token (as-contract tx-sender))))

;; Function to update streaming data
(define-public (update-streaming-data (token-id uint) (new-streams uint))
  (let ((current-data (default-to 
                        { total-streams: u0, last-updated: u0 } 
                        (map-get? streaming-data {token-id: token-id}))))
    (map-set streaming-data 
      {token-id: token-id} 
      { 
        total-streams: (+ (get total-streams current-data) new-streams),
        last-updated: block-height
      })
    (ok true)))


;; Set Oracle Address
(define-public (set-oracle-address (new-address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set oracle-address new-address)
    (ok true)))
