require('./g.js');
extract(obj_props);

let opts = (curr_index, array, r_) => ({
  curr_index,
  push: (n) => {
    curr_index.to_const(r_, (v) => {
      typeof n == 'number' ? array[v].add(n) : n.add_to(array[v]);
    });
    curr_index.add(1);
  },
  display: (x, y, spacing = 45) => {
    for (let i in array) {
      i = array[i];
      i.display(x, y);
      x += spacing;
    }
  },
  display_reverse: (x, y, spacing = 45) => {
    let act_spacing = spacing * array.length - x;
    for (let i in array) {
      i = array[i];
      i.display(act_spacing, y);
      act_spacing -= spacing;
    }
  },
  pop: () => {
    curr_index.to_const(r_, (cunter_valu) => {
      if (cunter_valu > 0) {
        array[cunter_valu - 1].reset();
      } else {
        array[cunter_valu].reset();
      }
      curr_index.subtract(1);
    });
  },
  get_index: (i, cb) => {
    array[i].to_const(r_, (v) => cb(v));
  },
  read_top: (cb) => {
    curr_index.to_const(r_, (cunter_valu) => {
      cb(parseInt(cunter_valu));
    });
  },
  for_each: (cb) => {
    for (let i in r_) {
      i = r_[i];
      cb(array[i], i);
    }
  },
  array,
});

module.exports = {
  create: (length) => {
    length = length - 1;
    let curr_index = counter(0);
    let array = ' '
      .repeat(length)
      .split(' ')
      .map((x) => counter(0));

    let r_ = range(0, length + 1);

    return opts(curr_index, array, r_);
  },
  from: (input) => {
    length = input.length - 1;
    let curr_index = counter(0);
    let array = [];

    let range = range(0, length + 1);

    for (let i in range) {
      i = range[i];
      array.push(counter(input[i]));
    }

    return opts(curr_index, length, array, r_);
  },
};
