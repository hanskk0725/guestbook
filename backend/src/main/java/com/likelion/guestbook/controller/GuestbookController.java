package com.likelion.guestbook.controller;

import com.likelion.guestbook.domain.Guestbook;
import com.likelion.guestbook.repository.GuestbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guestbook")
public class GuestbookController {

    private final GuestbookRepository guestbookRepository;

    @GetMapping
    public List<Guestbook> list() {
        return guestbookRepository.findAll();
    }

    @PostMapping
    public Guestbook create(@RequestBody Guestbook guestbook) {
        return guestbookRepository.save(guestbook);
    }
}
