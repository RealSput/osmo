console.time('G.js time')

const vctr = require("./vctr");
const fs = require("fs");
setPriority("groups");

const gs = gamescene();

let add_stack = (arr) => {
  arr.read_top((index) => {
    if (index > 1) {
      let top_counter = arr.array[index - 1];
      let bef_counter = arr.array[index - 2];
      while_loop(greater_than(top_counter, 0), () => {
        top_counter.subtract(1);
        bef_counter.add(1);
      });
    }
  });
  arr.curr_index.subtract(1);
};

let read_stack = (arr, cb) => {
  arr.read_top((index) => {
    if (index > 1) {
      let top_counter = arr.array[index - 1];
      cb(top_counter, arr.array[index - 2], index);
    } else {
      cb(arr.array[1], arr.array[0], index);
    }
  });
};

let limit = 10;

let opcodes = vctr.create(limit);
let operands = vctr.create(limit);
let stack = vctr.create(10);
let instr_pointer = counter(0);
let is_halted = counter(1);
let input = counter();
let is_finish_end = counter(false);
let is_on_input = counter(false);

let inp_disp_group = unknown_g();

inp_disp_group.alpha(0, 0);

let ip_group = unknown_g();
$.add({
  OBJ_ID: 211,
  X: 15,
  Y: 130,
  GROUPS: ip_group,
});

$.add(
  "Input mode. Click on left side to add to input counter, and on right to enter"
    .to_obj()
    .with(X, 200)
    .with(Y, 230)
    .with(GROUPS, inp_disp_group)
    .with(SCALING, 0.2)
);

$.add(input.to_obj().with(X, 200).with(Y, 200).with(GROUPS, inp_disp_group));

operands.display(15, 75);
stack.display(15, 15);

let opcodes_list = {
  CONST: 1,
  ADD: 2,
  DROP: 3,
  SUB: 4,
  HALT: 5,
  INPUT: 6,
};

let instr_length = range(0, Object.keys(opcodes_list).length + 1);

let opcodes_functions = {
  1: trigger_function(() => {
    instr_pointer.to_const(instr_length, (l) => {
      let curr_operand = operands.array[l];
      stack.push(curr_operand);
    });
  }),
  2: trigger_function(() => {
    add_stack(stack);
  }),
  3: trigger_function(() => {
    stack.pop();
  }),
  4: trigger_function(() => {
    read_stack(stack, (cunter_a, cunter_b) => {
      cunter_a.subtract_from(cunter_b);
    });
    stack.curr_index.subtract(1);
  }),
  5: trigger_function(() => {
    is_halted.add(1);
    instr_pointer.reset();
    is_finish_end.add(1);
  }),
  6: trigger_function(() => {
    is_halted.add(1);
    is_on_input.add(1);
    inp_disp_group.alpha(1, 0.3);
  }),
};

let objs = ["NOP"];
for (let i in opcodes_list) {
  objs.push(i);
}

let stack_texts = [];

let x = 15;
let y = 100;
let rr = range(0, limit);

for (let i in rr) {
  i = rr[i];
  let slot = [];
  objs.forEach((z) => {
    let g = unknown_g();
    let o = z.to_obj().with(X, x).with(Y, y).with(GROUPS, g).with(SCALING, 0.3);
    $.add(o);
    if (z != "NOP") $.add(toggle_off_trigger(g));
    slot.push({
      text: z,
      show: () => $.add(toggle_on_trigger(g)),
      hide: () => $.add(toggle_off_trigger(g)),
    });
  });
  stack_texts.push(slot);
  x += 45;
}

let cr = unknown_c();
let cr2 = unknown_c();
let crg = unknown_g();

$.add({
  OBJ_ID: 211,
  X: 15,
  Y: 100,
  GROUPS: crg,
  Z_LAYER: -100,
});

$.add({
  OBJ_ID: 211,
  X: 500,
  Y: 100,
  COLOR: cr,
});

$.add({
  OBJ_ID: 211,
  X: 250,
  Y: 250,
  COLOR: cr2,
});

$.add("Run program".to_obj().with(X, 500).with(Y, 100).with(SCALING, 0.4));
let to_const_cb = (counter, range, cb) => {
  for (let i in range) {
    i = range[i];
    let cba = (ctx) => {
      counter.if_is(EQUAL_TO, i, ctx);
    };
    cb(i, cba);
  }
};

let exec_instructions = trigger_function(() => {
  wait(0.1);
  while_loop(less_than(is_halted, 1), () => {
    instr_pointer.to_const(range(0, limit), (curr_pos) => {
      let i = opcodes.array[curr_pos];
      to_const_cb(i, instr_length, (instruction, cn) => {
        if (instruction > 0) {
          let fn = opcodes_functions[instruction];
          cn(fn);
        }
      });
    });
    wait(0.5);
    instr_pointer.add(1);
    instr_pointer.if_is(
      SMALLER_THAN,
      10,
      trigger_function(() => {
        ip_group.move(45, 0, 0, NONE, 2, 1, 1, false, false);
      })
    );
    instr_pointer.if_is(
      LARGER_THAN,
      10,
      trigger_function(() => {
        is_halted.add(1);
        instr_pointer.subtract(11);
        is_finish_end.add(1);
        cr2.set(rgb(0, 255, 0), 0.3);
        ip_group.move(-495, 0, 0, NONE, 2, 1, 1, false, false);
      })
    );
  });
});

let curr_pos = counter(0);
let row_pos = counter(0);
let is_on_finish_button = counter(false);

on(
  gs.button_a(),
  trigger_function(() => {
    is_finish_end.if_is(
      EQUAL_TO,
      0,
      trigger_function(() => {
        is_on_input.if_is(
          EQUAL_TO,
          0,
          trigger_function(() => {
            is_on_finish_button.if_is(
              EQUAL_TO,
              0,
              trigger_function(() => {
                row_pos.if_is(
                  EQUAL_TO,
                  0,
                  trigger_function(() => {
                    let row = opcodes.array;
                    let _limit = instr_length[instr_length.length - 1];

                    curr_pos.to_const(range(0, limit), (position) => {
                      row[position].if_is(
                        EQUAL_TO,
                        _limit,
                        trigger_function(() => {
                          row[position].subtract(_limit + 1);
                          let le = stack_texts[position];
                          le[le.length - 1].hide();
                        })
                      );

                      row[position].if_is(
                        SMALLER_THAN,
                        _limit,
                        trigger_function(() => {
                          row[position].add(1);
                        })
                      );

                      row[position].to_const(instr_length, (de) => {
                        stack_texts[position][de].show();
                        if (de > 0) stack_texts[position][de - 1].hide();
                      });
                    });
                  })
                );

                row_pos.if_is(
                  EQUAL_TO,
                  1,
                  trigger_function(() => {
                    let row = operands.array;
                    curr_pos.to_const(range(0, limit), (position) => {
                      row[position].add(1);
                    });
                  })
                );
              })
            );

            is_on_finish_button.if_is(
              EQUAL_TO,
              1,
              trigger_function(() => {
                is_on_finish_button.subtract(1);
                is_halted.subtract(1);
                cr.set(rgb(255, 255, 255));
                exec_instructions.call();
              })
            );
          })
        );

        is_on_input.if_is(
          EQUAL_TO,
          1,
          trigger_function(() => {
            input.add(1);
          })
        );
      })
    );

    is_finish_end.if_is(
      EQUAL_TO,
      1,
      trigger_function(() => {
        is_finish_end.subtract(1);
        cr2.set(rgb(255, 255, 255));
        stack.for_each((x) => {
          x.reset();
        });
      })
    );
  })
);

let lfbs = counter();

on(
  gs.button_b(),
  trigger_function(() => {
    is_on_input.if_is(
      EQUAL_TO,
      0,
      trigger_function(() => {
        row_pos.if_is(
          EQUAL_TO,
          1,
          trigger_function(() => {
            crg.move(45, 25, 0, NONE, 2, 1, 1, false, false);
            row_pos.subtract(1);
            curr_pos.add(1);
            lfbs.add(1);
          })
        );

        row_pos.if_is(
          EQUAL_TO,
          0,
          trigger_function(() => {
            lfbs.if_is(
              EQUAL_TO,
              0,
              trigger_function(() => {
                crg.move(0, -25, 0, NONE, 2, 1, 1, false, false);
                row_pos.add(1);
              })
            );
            lfbs.if_is(
              EQUAL_TO,
              1,
              trigger_function(() => {
                lfbs.subtract(1);
              })
            );
          })
        );

        curr_pos.if_is(
          EQUAL_TO,
          limit,
          trigger_function(() => {
            cr.set(rgb(0, 255, 0), 0.3);
            is_on_finish_button.if_is(
              EQUAL_TO,
              0,
              trigger_function(() => {
                is_on_finish_button.add(1);
              })
            );
          })
        );

        curr_pos.if_is(
          EQUAL_TO,
          limit + 1,
          trigger_function(() => {
            // reset
            curr_pos.subtract(limit + 1);
            is_on_finish_button.subtract(1);
            cr.set(rgb(255, 255, 255));
            crg.move(-495, 0, 0, NONE, 2, 1, 1, false, false);
          })
        );
      })
    );

    is_on_input.if_is(
      EQUAL_TO,
      1,
      trigger_function(() => {
        is_on_input.subtract(1);
        stack.push(input);
        is_halted.subtract(1);
        inp_disp_group.alpha(0, 0.3);
        wait(0.3);
        exec_instructions.call();
      })
    );
  })
);

(async () => {
	await $.exportToSavefile({ info: true });
	console.timeEnd('G.js time');
})();
