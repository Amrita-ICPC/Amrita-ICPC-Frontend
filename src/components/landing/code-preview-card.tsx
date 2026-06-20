import { CircleCheck, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type Token = { text: string; cls?: "kw" | "ty" | "fn" | "st" | "cm" | "nu" };

const CODE: Token[][] = [
    [{ text: "#include", cls: "kw" }, { text: " <bits/stdc++.h>" }],
    [{ text: "using namespace ", cls: "kw" }, { text: "std", cls: "ty" }, { text: ";" }],
    [],
    [{ text: "int ", cls: "kw" }, { text: "main", cls: "fn" }, { text: "() {" }],
    [{ text: "  " }, { text: "int ", cls: "kw" }, { text: "n; cin >> n;" }],
    [
        { text: "  vector<" },
        { text: "long long", cls: "ty" },
        { text: "> dp(n+" },
        { text: "1", cls: "nu" },
        { text: ", " },
        { text: "LLONG_MAX", cls: "ty" },
        { text: ");" },
    ],
    [
        { text: "  dp[" },
        { text: "0", cls: "nu" },
        { text: "] = " },
        { text: "0", cls: "nu" },
        { text: ";" },
    ],
    [{ text: "  // classic coin-change DP", cls: "cm" }],
    [
        { text: "  " },
        { text: "for ", cls: "kw" },
        { text: "(" },
        { text: "int ", cls: "kw" },
        { text: "c : {" },
        { text: "1", cls: "nu" },
        { text: "," },
        { text: "5", cls: "nu" },
        { text: "," },
        { text: "10", cls: "nu" },
        { text: "," },
        { text: "25", cls: "nu" },
        { text: "}) {" },
    ],
    [
        { text: "    " },
        { text: "for ", cls: "kw" },
        { text: "(" },
        { text: "int ", cls: "kw" },
        { text: "i=c; i<=n; i++)" },
    ],
    [{ text: "      if (dp[i-c] != " }, { text: "LLONG_MAX", cls: "ty" }, { text: ")" }],
    [
        { text: "        dp[i] = " },
        { text: "min", cls: "fn" },
        { text: "(dp[i], dp[i-c]+" },
        { text: "1", cls: "nu" },
        { text: ");" },
    ],
    [{ text: "  }" }],
    [{ text: "  cout << dp[n] << " }, { text: '"\\n"', cls: "st" }, { text: ";" }],
    [{ text: "  " }, { text: "return ", cls: "kw" }, { text: "0", cls: "nu" }, { text: ";" }],
    [{ text: "}" }],
];

export function CodePreviewCard() {
    return (
        <Card className="landing-editor">
            <CardHeader className="landing-editor-top">
                <div className="landing-mac-dots">
                    <span className="landing-mac-dot" style={{ background: "#ff5f57" }} />
                    <span className="landing-mac-dot" style={{ background: "#fec024" }} />
                    <span className="landing-mac-dot" style={{ background: "#29c940" }} />
                </div>
                <span className="landing-editor-fname">coin_change.cpp — Weekly Contest 12</span>
                <div className="landing-editor-live">
                    <span className="landing-live-pip" />
                    Live
                </div>
            </CardHeader>

            <CardContent className="landing-editor-body">
                {CODE.map((tokens, i) => (
                    <div
                        key={i}
                        className="landing-code-line"
                        style={{ animationDelay: `${i * 55}ms` }}
                    >
                        <span className="landing-line-num">{i + 1}</span>
                        <span className="landing-code-text">
                            {tokens.map((token, j) => (
                                <span
                                    key={j}
                                    className={token.cls ? `landing-tok-${token.cls}` : undefined}
                                >
                                    {token.text}
                                </span>
                            ))}
                        </span>
                    </div>
                ))}
            </CardContent>

            <CardFooter className="landing-editor-foot">
                <div className="landing-verdict">
                    <CircleCheck className="size-3.5" />
                    Accepted · 4/4 tests
                </div>
                <Button size="sm" className="landing-submit-btn">
                    <Send className="size-3" />
                    Submit
                </Button>
            </CardFooter>
        </Card>
    );
}
