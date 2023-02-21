import { tr, td, th, b, table, tbody, a, span, fragment } from "../src/html.js";

test("html tags should return the correct html", () => {
    expect(tr("foo", "bar")).toBe("<tr>foobar</tr>\n");
    expect(td("foo", "bar")).toBe("<td>foobar</td>\n");
    expect(th("foo", "bar")).toBe("<th>foobar</th>\n");
    expect(b("foo", "bar")).toBe("<b>foobar</b>");
    expect(table("foo", "bar")).toBe("<table>foobar</table>\n");
    expect(tbody("foo", "bar")).toBe("<tbody>foobar</tbody>\n");
    expect(a("foo", "bar")).toBe("<a>foobar</a>");
    expect(span("foo", "bar")).toBe("<span>foobar</span>\n");
});

test("html fragment should return the children", () => {
    expect(fragment()).toBe("");
    expect(fragment("foo")).toBe("foo");
    expect(fragment("foo", "bar")).toBe("foobar");
});

test("html tags should accept props", () => {
    expect(a({ href: "http://www.example.com" }, "example")).toBe(
        "<a href='http://www.example.com'>example</a>",
    );
    expect(
        a({ href: "http://www.example.com", target: "_blank" }, "example"),
    ).toBe("<a href='http://www.example.com' target='_blank'>example</a>");
});
