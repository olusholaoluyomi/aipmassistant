#!/usr/bin/env python3
"""
teams_notify.py — Send Adaptive Card notifications to a Teams channel via Power Automate webhook.

Supported card elements (all optional except --title and --body):
  --title        Card heading (bold, accent color)
  --body         Main text (wraps)
  --facts        Key:Value pairs — "Squad:CB,Date:2026-04-08,Blocked:3"
  --buttons      Label:URL pairs — "Open Jira:https://...,View Confluence:https://..."
  --color        Accent color: "good" (green) | "warning" (yellow) | "attention" (red) | "accent" (default)
  --subtitle     Smaller text below the title

Usage examples:
  python3 teams_notify.py --title "Sprint 14 Live" --body "Release notes published." --buttons "View Notes:https://confluence.unifonic.com/..."
  python3 teams_notify.py --title "Blocker Alert" --body "3 tickets blocked in CB sprint." --facts "Squad:CB,Blockers:3,Days:2+" --color attention
  python3 teams_notify.py --title "Daily Digest" --subtitle "Flow Studio — 2026-04-08" --body "Sprint on track. 2 items in PO Review." --facts "Done:6,In Progress:8,Blocked:1" --buttons "Jira Board:https://unifonic.atlassian.net/jira/software/projects/CB/boards"
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def send_card(
    title: str,
    body: str,
    subtitle: str = None,
    facts: list[dict] = None,
    buttons: list[dict] = None,
    color: str = "accent"
) -> bool:
    """
    Send an Adaptive Card to Teams via Power Automate webhook.

    Args:
        title:    Card heading
        body:     Main message text
        subtitle: Optional secondary line under the title
        facts:    List of {"title": "Key", "value": "Value"} dicts
        buttons:  List of {"type": "Action.OpenUrl", "title": "Label", "url": "..."} dicts
        color:    TextBlock color — "accent" | "good" | "warning" | "attention" | "default"
    """
    webhook_url = os.environ.get("TEAMS_WEBHOOK_URL")
    if not webhook_url:
        print("ERROR: TEAMS_WEBHOOK_URL not set in environment or .env", file=sys.stderr)
        return False

    # Build card body
    card_body = [
        {
            "type": "TextBlock",
            "size": "Medium",
            "weight": "Bolder",
            "color": color,
            "text": title,
            "wrap": True
        }
    ]

    if subtitle:
        card_body.append({
            "type": "TextBlock",
            "size": "Small",
            "isSubtle": True,
            "text": subtitle,
            "wrap": True,
            "spacing": "None"
        })

    card_body.append({
        "type": "TextBlock",
        "text": body,
        "wrap": True,
        "spacing": "Medium"
    })

    if facts:
        card_body.append({
            "type": "FactSet",
            "spacing": "Medium",
            "facts": facts
        })

    # Build actions (buttons)
    actions = []
    if buttons:
        for btn in buttons:
            actions.append({
                "type": "Action.OpenUrl",
                "title": btn["title"],
                "url": btn["url"]
            })

    card_content = {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.2",
        "body": card_body
    }

    if actions:
        card_content["actions"] = actions

    payload = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "contentUrl": None,
                "content": card_content
            }
        ]
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        webhook_url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 202)
    except urllib.error.HTTPError as e:
        print(f"ERROR: HTTP {e.code} — {e.reason}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Send a Teams Adaptive Card notification")
    parser.add_argument("--title",    required=True,  help="Card heading")
    parser.add_argument("--body",     required=True,  help="Main message text")
    parser.add_argument("--subtitle", default=None,   help="Secondary line under the title")
    parser.add_argument("--facts",    default=None,   help="Comma-separated Key:Value pairs")
    parser.add_argument("--buttons",  default=None,   help="Comma-separated Label:URL pairs")
    parser.add_argument("--color",    default="accent",
                        choices=["accent", "good", "warning", "attention", "default"],
                        help="Title color (default: accent)")
    args = parser.parse_args()

    facts = None
    if args.facts:
        facts = [
            {"title": kv.split(":", 1)[0].strip(), "value": kv.split(":", 1)[1].strip()}
            for kv in args.facts.split(",")
            if ":" in kv
        ]

    buttons = None
    if args.buttons:
        buttons = [
            {"title": kv.split(":", 1)[0].strip(), "url": kv.split(":", 1)[1].strip()}
            for kv in args.buttons.split(",", maxsplit=10)
            if ":" in kv
        ]

    success = send_card(
        title=args.title,
        body=args.body,
        subtitle=args.subtitle,
        facts=facts,
        buttons=buttons,
        color=args.color
    )

    if success:
        print("Message sent to Teams.")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
