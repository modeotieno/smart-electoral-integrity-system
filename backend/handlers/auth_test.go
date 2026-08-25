package handlers

import "testing"

func TestNormalizeRole(t *testing.T) {
	cases := []struct{ in, want string }{
		{"", "citizen"},
		{"citizen", "citizen"},
		{"Voter", "citizen"},
		{"election observer", "observer"},
		{"observer", "observer"},
		{"Candidate", "candidate"},
		{"presiding officer", "presiding_officer"},
		{"returning officer", "returning_officer"},
		{"admin", "election_administrator"},
		{"election administrator", "election_administrator"},
		{"system administrator", "election_administrator"},
		{"unknownrole", "citizen"},
	}
	for _, tc := range cases {
		got := normalizeRole(tc.in)
		if got != tc.want {
			t.Fatalf("normalizeRole(%q)=%q want %q", tc.in, got, tc.want)
		}
	}
}

func TestHashBioConsistent(t *testing.T) {
	h1 := hashBio("test data")
	h2 := hashBio("test data")
	h3 := hashBio("different")
	if h1 != h2 {
		t.Fatalf("hash not consistent")
	}
	if h1 == h3 {
		t.Fatalf("different inputs same hash")
	}
	if len(h1) != 64 {
		t.Fatalf("sha256 hex len want 64 got %d", len(h1))
	}
}
