---
uuid: a16b682f-53a9-4958-bb47-eba63c4e03e2
title: LeetCode - add-two-numbers
tags:
  - leetcode
  - algorithms
  - c++
categories:
  - LeetCode 刷題目
series: LeetCode
mathjax: true
date: 2019-02-20 00:00:00
updated: 2019-02-20 00:00:00
---

> Leetcode: [add-two-numbers](https://leetcode.com/problems/add-two-numbers/) {% label warning@Medium %}

<!--more-->

# [正文]

## 題目
You are given two {% label info@non-empty %} linked lists representing two non-negative integers. The digits are stored in {% label info@reverse order %} and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

{% codeblock example lang:plain line_number:false %}
Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
Explanation: 342 + 465 = 807.
{% endcodeblock %}

## 分析
題目就是做數字相加，數字的資料結構是 reverse linked list，相加不難，只要好好維護 carry 加到下一位數上就好，主要的難點在於會不會操作 linked list;

## code
{% codeblock lang:cpp line_number:true highlight:true first_line:1 %}
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        int carry = 0;
        ListNode *root = NULL, **point = &root;
        do {
            int add = carry;
            if ( l1 != NULL ) { add += l1->val; l1 = l1->next; }
            if ( l2 != NULL ) { add += l2->val; l2 = l2->next; }

            carry = add / 10; add %= 10;

            *point = new ListNode(add); point = &(*point)->next;
        } while ( l1 != NULL || l2 != NULL );

        if ( carry > 0 ) {
            *point = new ListNode(1);
        }

        return root;
    }
};
{% endcodeblock %}

{% note info %}
1. root 指向 linked list 最一開始的 node;
2. point 是指標的指標，用來指向目前 linked list 最後一個 node 的位置;
{% endnote %}

{% codeblock lang:cpp line_number:true highlight:true first_line:1 %}
static const auto speedup = []() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(NULL);
    return 0;
}();
{% endcodeblock %}
{% note info %}
1. 再看別人怎麽寫的時候，發現加上這一段 code，runtime 居然變成 20ms，整個快兩倍;
2. 原因從這篇文章獲得解答：[C++ 的輸出入 cin-cout 和 scanf-printf 誰比較快？](http://chino.taipei/note-2016-0311C-%E7%9A%84%E8%BC%B8%E5%87%BA%E5%85%A5cin-cout%E5%92%8Cscanf-printf%E8%AA%B0%E6%AF%94%E8%BC%83%E5%BF%AB%EF%BC%9F/);
3. 主要在說 cin/cout 預設必須要跟 stdin/stdout 同步，所以必須做額外的運算，這東西就是把同步和緩衝關閉;
{% endnote %}
