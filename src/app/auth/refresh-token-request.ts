export class RefreshTokenRequest {
    refreshTokenId: number;

    constructor(tokenId: number) {
        this.refreshTokenId = tokenId;     
    }
}