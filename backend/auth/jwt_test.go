package auth

import "testing"

func TestGenerateAndParseToken(t *testing.T) {
	token, err := GenerateToken(42, "test@example.com", "citizen")
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}
	claims, err := ParseToken(token)
	if err != nil {
		t.Fatalf("ParseToken: %v", err)
	}
	if claims.UserID != 42 || claims.Email != "test@example.com" || claims.Role != "citizen" {
		t.Fatalf("claims: %+v", claims)
	}
	if claims.Issuer != "seis" {
		t.Fatalf("issuer: %s", claims.Issuer)
	}
}

func TestParseInvalidToken(t *testing.T) {
	_, err := ParseToken("invalid.token.here")
	if err == nil {
		t.Fatalf("expected error for invalid token")
	}
}

func TestGenerateToken_Roles(t *testing.T) {
	roles := []string{"election_administrator", "returning_officer", "presiding_officer", "observer", "candidate"}
	for _, r := range roles {
		tok, err := GenerateToken(1, "a@b.com", r)
		if err != nil {
			t.Fatalf("role %s: %v", r, err)
		}
		claims, err := ParseToken(tok)
		if err != nil || claims.Role != r {
			t.Fatalf("role %s: claims %+v err %v", r, claims, err)
		}
	}
}
