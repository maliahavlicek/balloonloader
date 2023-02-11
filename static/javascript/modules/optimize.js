function optimize(targets, pieces, vals, opts) {
    const sections = targets.length;
    console.log(sections);
    const count = vals.length;
    let besties = null;
    let best = null;
    const assigns = new Array(count);
    const check = function () {
        const totals = [0, 0, 0, 0];
        assigns.forEach(function (fl, ix) {
            totals[fl] += vals[ix];
        });
        const vert = totals[0] + totals[1] - totals[2] - totals[3];
        if (vert < 0 || totals[0] < totals[1] || totals[2] < totals[3]) return;
        const score =
            combine(totals[0] - totals[1], totals[2] - totals[3], opts.exponent)
            + vert * opts.balance;
        if (besties === null || best > score) {
            besties = [];
            best = score;
        }
        if (best >= score) {
            besties.push([...assigns]);
        }
    };
    const recurse = function (n) {
        if (!n) return check();
        for (let v = 0; v < sections; v++) {
            assigns[n - 1] = v;
            recurse(n - 1);
        }
    };
    recurse(count);
    console.log(besties);
    const choice = besties[Math.floor(Math.random() * besties.length)];
    pieces.forEach(function (piece, ix) {
        targets[choice[ix]].append(piece);
    });
}

const combine = (v1, v2, exp) =>
    exp ? (v1 ** exp + v2 ** exp) ** (1 / exp) : Math.max(v1, v2);
