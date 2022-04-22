export default interface JWTPayload {
  email: string;
  restaurantId: number;
  iat: number;
  exp: number;
}
