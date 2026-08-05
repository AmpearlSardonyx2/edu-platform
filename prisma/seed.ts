import { PrismaClient, NodeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dsa = await prisma.node.upsert({
    where: { slug: "dsa" },
    update: {},
    create: { slug: "dsa", title: "DSA", type: NodeType.SUBJECT, orderIndex: 1 },
  });

  const sorting = await prisma.node.upsert({
    where: { slug: "sorting" },
    update: {},
    create: { slug: "sorting", title: "Sorting", type: NodeType.CHAPTER, orderIndex: 1, parentId: dsa.id },
  });

  await prisma.node.upsert({ where: { slug: "searching" }, update: {}, create: { slug: "searching", title: "Searching", type: NodeType.CHAPTER, orderIndex: 2, parentId: dsa.id } });
  await prisma.node.upsert({ where: { slug: "linked-list" }, update: {}, create: { slug: "linked-list", title: "Linked List", type: NodeType.CHAPTER, orderIndex: 3, parentId: dsa.id } });

  const bubbleSort = await prisma.node.upsert({
    where: { slug: "bubble-sort" },
    update: {},
    create: { slug: "bubble-sort", title: "Bubble Sort", type: NodeType.ALGORITHM, orderIndex: 1, parentId: sorting.id },
  });

  await prisma.node.upsert({ where: { slug: "selection-sort" }, update: {}, create: { slug: "selection-sort", title: "Selection Sort", type: NodeType.ALGORITHM, orderIndex: 2, parentId: sorting.id } });
  await prisma.node.upsert({ where: { slug: "insertion-sort" }, update: {}, create: { slug: "insertion-sort", title: "Insertion Sort", type: NodeType.ALGORITHM, orderIndex: 3, parentId: sorting.id } });

  await prisma.lesson.upsert({
    where: { nodeId: bubbleSort.id },
    update: {},
    create: {
      nodeId: bubbleSort.id,
      entryFunctionName: "bubbleSort",
      defaultCode: `function bubbleSort(arr, trace) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      trace.compare(j, j + 1);
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        trace.swap(j, j + 1);
      }
    }
    trace.markSorted(n - 1 - i);
  }
  trace.markSorted(0);
  return arr;
}`,
      explanationStart: "The crates just arrived on the belt. The robot will roll to each pair, scan them, and swap only if they're out of order.",
      explanationCompareGreater: "Robot scans crate {a} and crate {b}: {a} is heavier, so it's in the wrong spot. Time to swap.",
      explanationCompareLess: "Robot scans crate {a} and crate {b}: already in the right order — rolling on to the next pair.",
      explanationSwap: "Robot picks up crate {a} and swaps it with crate {b}. They trade places on the belt.",
      explanationMarkSorted: 'Crate {v} gets a "Sorted" sticker — it\'s in its final spot and the robot won\'t touch it again.',
      explanationDone: "Every crate has a sticker. Warehouse complete — the belt is fully sorted!",
    },
  });

  console.log("Seeded nodes + bubble sort lesson");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());