import imaplib, time, getpass, uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

GMAIL_USER = "usman@harvics.com"
SIG_PATH   = "/Users/shahtabraiz/Desktop/DATA/signature_small.jpg"

print("Enter Gmail App Password (hidden):")
APP_PASSWORD = getpass.getpass("")

with open(SIG_PATH, "rb") as f:
    SIG_DATA = f.read()
print(f"Signature loaded ({len(SIG_DATA)//1024}KB)\n")

drafts = [

("b.retterath@tom-tailor.com",
"Denim Sourcing — Turkey + Vietnam Margin Opportunity for Tom Tailor",
"""Hi Bastian,

Harvics Global Ventures is a global sourcing and distribution infrastructure — we work across Turkey, Vietnam, Pakistan and South Asia placing volume denim orders for retail clients in the UK and EU.

With your mandate at Tom Tailor to optimise sourcing and sustainability, two things are immediately relevant:

1. Vietnam-origin denim: EVFTA eliminates duty entirely for EU import — meaningful margin gain on volume
2. Our vetted SEDEX-compliant mills in Turkey can match Tom Tailor's compliance standards without the typical lead time penalty

I'll be at Munich Fabric Start July 14–16. Worth 20 minutes at the show or on a call before?

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("orkun.ataoglu@kik.de",
"Volume Denim Sourcing — Price-Competitive Supply for KiK",
"""Hi Orkun,

Harvics Global Ventures sources and distributes denim across 42 markets. At the scale KiK operates — 3,500 stores — the sourcing economics we can offer are worth a direct conversation.

Specifically: Pakistan-origin denim under GSP+ gives KiK a duty advantage that translates directly to shelf margin. We have SEDEX-audited, high-capacity mills producing at volumes your business requires.

I'll be at Munich Fabric Start July 14–16. Happy to come with a specific category brief and price benchmarks.

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("radek.sorcik@takko.com",
"Denim Sourcing — QA-Vetted Supply Across Turkey & Pakistan | Takko",
"""Hi Radek,

As Senior Director overseeing Purchase and QA at Takko, you'll know the pressure of maintaining quality compliance across 1,900 stores in 17 markets.

Harvics Global Ventures provides sourcing infrastructure — QA-vetted, SEDEX-compliant denim supply from Turkey and Pakistan. We handle the audit layer so your team doesn't carry the compliance risk.

I'll be at Munich Fabric Start July 14–16. Happy to bring a category breakdown and compliance documentation for a direct conversation.

Regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("n.aljes@bonprix.de",
"Denim Sourcing — EVFTA Margin Opportunity for bonprix Online",
"""Hi Norbert,

Harvics Global Ventures works with online-first retailers across Europe on denim sourcing — specifically leveraging EVFTA (Vietnam) and GSP+ (Pakistan) to recover margin at scale.

For bonprix's model — high volume, 30-country reach, data-driven buying — the duty savings available through Vietnam-origin denim under EVFTA are directly relevant and often underutilised.

I'll be at Munich Fabric Start July 14–16. Would you be open to a 20-minute conversation at the show or on a call before?

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("mike.mahlmann@nkd.de",
"Denim Sourcing — Volume Pricing for NKD's 2,100-Store Network",
"""Hi Mike,

Harvics Global Ventures specialises in high-volume denim sourcing across Pakistan and Turkey — categories directly relevant to NKD's scale.

With 2,100 stores and a value-tier customer base, price discipline in denim is everything. Pakistan-origin supply under GSP+ gives NKD a structural duty advantage, and our mills are fully SEDEX-audited — no compliance risk on your end.

Available for Munich Fabric Start July 14–16 or a call before. Happy to bring cost benchmarks for your core denim categories.

Regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("martijn.vanderzee@canda.com",
"Denim Sourcing — Compliance-Led Supply for C&A's 1,500 Stores",
"""Dear Martijn,

Harvics Global Ventures provides sourcing infrastructure for European retail at scale — SEDEX, GOTS, and OEKO-TEX compliant supply chains across Turkey, Vietnam, and South Asia.

For C&A's 1,500-store European network, compliance is non-negotiable. Our supply chain model is built around it — not bolted on. Every mill we work with carries full social audit credentials before the first order is placed.

I'll be at Munich Fabric Start July 14–16. Would welcome 20 minutes at the show.

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("mehmet.serdar.ozcan@calikdenim.com",
"Meeting at Bluezone Munich — Harvics Buyer, July 14–16",
"""Hi Mehmet,

Harvics Global Ventures will be attending Munich Fabric Start / Bluezone as a buyer — July 14–16 at MOC Munich.

Calik Denim's GOTS-certified sustainable range is directly relevant to the European retail clients we represent. As the sales director covering Germany and Northern Europe, you're exactly who I need to speak to about commercial terms and minimum order quantities.

Could we schedule 20–30 minutes at Bluezone? I'll come with a specific buyer brief for the AW27 season.

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("marco.lucietti@iskodenim.com",
"Buyer Meeting at Bluezone — Harvics Global Ventures, July 14–16",
"""Hi Marco,

I noted you'll be joining the panel at Munich Fabric Start this season — Harvics Global Ventures will also be there as a confirmed buyer.

We source and distribute denim across 42 markets and represent retail clients in the UK and EU. ISKO's innovation pipeline — particularly around sustainable and functional denim — is directly relevant to the briefs we're working against for AW27.

Would you have time for a buyer conversation at Bluezone? 20–30 minutes alongside the panel day would be ideal.

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

("sedef.uncuaki@orta.com.tr",
"Buyer Meeting at Bluezone Munich — Harvics Global Ventures",
"""Dear Dr. Uncu Aki,

Harvics Global Ventures will be attending Munich Fabric Start / Bluezone as a confirmed buyer — July 14–16 at MOC Munich.

ORTA's position as one of Turkey's leading SEDEX-compliant denim mills is directly relevant to the European retail clients we represent. Our buyers require full social audit compliance, and ORTA's track record speaks for itself.

I would welcome 20–30 minutes at Bluezone to discuss commercial terms for AW27. Could we schedule time at your stand?

Best regards,
Usman Shah
Founder & CEO | Harvics Global Ventures
+44 7405 527427 | sourcing@harvics.com"""),

]

def make_draft(to, subject, body_text):
    cid = f"sig_{uuid.uuid4().hex[:8]}"
    msg = MIMEMultipart("mixed")
    msg["From"]    = GMAIL_USER
    msg["To"]      = to
    msg["Subject"] = subject
    html = f"""<html><body>
<pre style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;">{body_text}</pre>
<br>
<img src="cid:{cid}" alt="Harvics Signature" style="max-width:500px;">
</body></html>"""
    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText(body_text, "plain", "utf-8"))
    alt.attach(MIMEText(html, "html", "utf-8"))
    msg.attach(alt)
    img = MIMEImage(SIG_DATA, _subtype="jpeg")
    img.add_header("Content-ID", f"<{cid}>")
    img.add_header("Content-Disposition", "inline", filename="signature.jpg")
    msg.attach(img)
    return msg.as_bytes()

try:
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(GMAIL_USER, APP_PASSWORD)
    print(f"Logged in as {GMAIL_USER}\n")

    for to, subject, body in drafts:
        raw = make_draft(to, subject, body)
        mail.append("[Gmail]/Drafts", "", imaplib.Time2Internaldate(time.time()), raw)
        print(f"  ✓ {to}")

    mail.logout()
    print(f"\n{len(drafts)} drafts created — one per company, signature embedded.")

except Exception as e:
    print(f"Error: {e}")
