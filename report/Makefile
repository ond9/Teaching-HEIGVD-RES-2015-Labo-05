#TEX=lualatex
TEX=pdflatex
TARGET=report.pdf

OPTS=
#OPTS= --shell-escape

all: $(TARGET)

%.pdf: %.tex
	$(TEX) $(OPTS) $^
	$(TEX) $(OPTS) $^

clean:
	rm *.aux *.log *.out *.toc $(TARGET)

.PHONY:
	clean
