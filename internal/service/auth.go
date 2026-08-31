
package service

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/ton-pay-router/core/config"
)

type AuthService struct {
	jwtSecret []byte
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{jwtSecret: []byte(cfg.JWTSecret)}
}

type Claims struct {
	MerchantID string `json:"merchant_id"`
	Role       string `json:"role"`
	jwt.RegisteredClaims
}

func (s *AuthService) GenerateToken(merchantID, role string) (string, error) {
	claims := Claims{
		MerchantID: merchantID,
		Role:       role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *AuthService) ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, err
}
