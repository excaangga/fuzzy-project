import rules from './rules.json' assert {type: 'json'};


function hitung_trapesium_kiri(x, l, r) {
    if (x <= l) {
      return 1;
    } else if (x >= l && x <=r) {
      return (r-x)/(r-l);
    } else {
      return 0;
    }
}
function hitung_trapesium_tengah(x, l_down, l_up, r_up, r_down) {
    if (x >= l_down && x <= l_up) {
      return (x-l_down)/(l_up-l_down);
    } else if (x >= l_up && x <= r_up) {
      return 1;
    } else if (x >= r_up && x <= r_down) {
      return (r_down-x)/(r_down-r_up);
    } else {
      return 0;
    }
}
function hitung_segitiga(x, l, p, r) {
    if (x <=l) {
      return 0;
    } else if (x >= l && x <= p) {
      return (x-l)/(p-l);
    } else if (x >= p && x <= r) {
      return (r-x)/(r-p);
    } else {
      return 0;
    }
}
function hitung_trapesium_kanan(x, l, r) {
    if (x <= l) {
      return 0;
    } else if (x >= l && x <= r) {
      return (x-l)/(r-l);
    } else {
      return 1;
    }
}
function get_anggota_fuzzy_cp(cp) {
    var typical_angina, atypical_angina, non_angina, asymptomatic = 0;
    if (cp == 1){
        typical_angina = 1;
    } else 0;
    if (cp == 2){
        atypical_angina = 1;
    } else 0;
    if (cp == 3){
        non_angina = 1;
    } else 0;
    if (cp == 4){
        asymptomatic = 1;
    } else 0;
    return {'typical angina': typical_angina, 'atypical angina': atypical_angina, 'non-angina': non_angina, 'asymptomatic': asymptomatic};
}  
function get_anggota_fuzzy_trtbps(trestbps) {
    var low = hitung_trapesium_kiri(trestbps, 111, 134);
    var medium = hitung_segitiga(trestbps, 127, 139, 153);
    var high = hitung_segitiga(trestbps, 142, 157, 172);
    var very_high = hitung_trapesium_kanan(trestbps, 154, 171);
    return {'low': low, 'medium': medium, 'high': high, 'very high': very_high};
}
function get_anggota_fuzzy_chol(chol) {
    var low = hitung_trapesium_kiri(chol, 151, 197);
    var medium = hitung_segitiga(chol, 188, 215, 250);
    var high = hitung_segitiga(chol, 217, 263, 307);
    var very_high = hitung_trapesium_kanan(chol, 281, 347);
    return {'low': low, 'medium': medium, 'high': high, 'very high': very_high};
}

function get_anggota_fuzzy_thalach(thalach) {
    var low = hitung_trapesium_kiri(thalach, 100, 141);
    var medium = hitung_segitiga(thalach, 111, 152, 194);
    var high = hitung_trapesium_kanan(thalach, 152, 216);
    return {'low': low, 'medium': medium, 'high': high};
}
function get_anggota_fuzzy_oldpeak(oldpeak) {
    var low = hitung_trapesium_kiri(oldpeak, 1, 2);
    var risk = hitung_segitiga(oldpeak, 1.5, 2.8, 4.2);
    var terrible = hitung_trapesium_kanan(oldpeak, 2.55, 4);
    return {'low': low, 'risk': risk, 'terrible': terrible};
}
function get_anggota_fuzzy_age(age) {
    var young = hitung_trapesium_kiri(age, 29, 38);
    var middle = hitung_segitiga(age, 33, 38, 45);
    var old = hitung_segitiga(age, 40, 48, 58);
    var very_old = hitung_trapesium_kanan(age, 52, 60);
    return {'young': young, 'mild': middle, 'old': old, 'very old': very_old};
}

// list_alpha = []

// for key in mu.keys():
//   for rule in list_rules:
//     if key in rule:
//       list_alpha.append(mu[key][rule[key]])

// return list_alpha

function get_alpha(list_rules, mu) {
    var list_alpha = [];
    for (var [key,val] of Object.entries(mu)) {
        for (var i=0;i<list_rules.length;i++){
            if (key in list_rules[i]){
                list_alpha.push(mu[key][list_rules[i][key]])
            }
        }
    }
    return list_alpha;
}
function get_z(list_rule, list_alpha) {
    var list_z = [];
    for (let [i, rule] of list_rule.entries()) {
      var z = compute_z(rule['output'], list_alpha[i]);
      list_z.push(z);
    }
    return list_z;
}
function compute_z(output, alpha) {
    if (output == 'less chance') {
      return alpha;
    } else {
      return 1 - alpha;
    }
}
function zip(a,b) {
    var result = [];
    b.forEach((el,ind) => {
        result.push([a[ind], el])
    });
    return result;
}

function defuzzification(list_alpha, list_z) {
    var numerator = 0;
    var denumerator = 0;
    var merged = zip(list_alpha,list_z);
    for (var i=0;i<merged.length;i++) {
        // console.log(merged[i][0]);
      numerator += merged[i][0]*merged[i][1];
      denumerator += merged[i][0];
    }
    denumerator += 1e-5;

    // console.log(numerator);
    return numerator/denumerator;
}








window.addEventListener("load", () => {
    const prediction = () => {
        // element
        const age = Number(document.getElementById("age").value);
        const chol = Number(document.getElementById("cholesterol").value);
        const trestbps = Number(document.getElementById("restingblood").value);
        const thalach = Number(document.getElementById("maxheart").value);
        const oldpeak = Number(document.getElementById("oldpeak").value);
        const cp = Number(document.getElementById("cp").value);
        
        const predict = document.getElementById("predict");

        var mu_cp = get_anggota_fuzzy_cp(cp);
        var mu_trestbps = get_anggota_fuzzy_trtbps(trestbps);
        var mu_chol = get_anggota_fuzzy_chol(chol);
        var mu_thalach = get_anggota_fuzzy_thalach(thalach);
        var mu_oldpeak = get_anggota_fuzzy_oldpeak(oldpeak);
        var mu_age = get_anggota_fuzzy_age(age);
        var mu = {
            'age': mu_age,
            'cholesterol': mu_chol,
            'resting bp s': mu_trestbps,
            'max heart rate': mu_thalach,
            'oldpeak': mu_oldpeak,
            'cp': mu_cp,
        };

        var alpha = get_alpha(rules, mu);
        var z = get_z(rules, alpha);
        // console.log(z);

        var output = defuzzification(alpha, z);
        if (output > 0.49999999){
            var pred = 'High Risk';
        }else{
            pred = 'Low Risk';
        }

        predict.innerHTML = pred;
    };

    const form = document.getElementById("form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        prediction();
    });
});
  